from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User
from .models import (
    BabysitterProfile,
    BabysitterExperience,
    BabysitterSchedule,
    BabysitterTraining,
    BabysitterBehavior,
    BabysitterActivities,
    BabysitterPersonalTraits,
    BabysitterReview,
)
from .serializers import (
    BabysitterPublicProfileSerializer,
    BabysitterProfileSerializer,
    BabysitterExperienceSerializer,
    BabysitterScheduleSerializer,
    BabysitterTrainingSerializer,
    BabysitterBehaviorSerializer,
    BabysitterActivitiesSerializer,
    BabysitterPersonalTraitsSerializer,
    BabysitterReviewSerializer,
)


def _get_or_create_profile(user):
    profile, _ = BabysitterProfile.objects.get_or_create(
        user=user,
        defaults={'bio': '', 'title': 'Babá profissional', 'linkedin': '', 'housing_available': False},
    )
    return profile


def _ensure_profiles_for_users(users):
    user_list = list(users)
    if not user_list:
        return []

    existing_user_ids = set(
        BabysitterProfile.objects.filter(user__in=user_list).values_list('user_id', flat=True)
    )
    missing_profiles = [
        BabysitterProfile(
            user=user,
            bio='',
            title='BabÃ¡ profissional',
            linkedin='',
            housing_available=False,
        )
        for user in user_list
        if user.id not in existing_user_ids
    ]
    if missing_profiles:
        BabysitterProfile.objects.bulk_create(missing_profiles)

    return list(
        BabysitterProfile.objects.filter(user__in=user_list)
        .select_related('user')
        .prefetch_related(
            'user__experiences',
            'user__schedules',
            'user__trainings',
            'user__received_reviews__reviewer',
        )
        .order_by('user__first_name', 'user__last_name', 'user__id')
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def babysitter_public_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id, user_type='babysitter')
    except User.DoesNotExist:
        return Response({'detail': 'Perfil não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    profile = _get_or_create_profile(user)
    serializer = BabysitterPublicProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def babysitter_public_profiles_list(request):
    users = User.objects.filter(user_type='babysitter').order_by('first_name', 'last_name', 'id')
    profiles = _ensure_profiles_for_users(users)
    serializer = BabysitterPublicProfileSerializer(
        profiles,
        many=True,
        context={'request': request},
    )
    return Response(serializer.data)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def babysitter_my_profile(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Apenas babás podem acessar este endpoint.'}, status=403)

    profile = _get_or_create_profile(request.user)

    if request.method == 'GET':
        serializer = BabysitterPublicProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    serializer = BabysitterProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        full = BabysitterPublicProfileSerializer(profile, context={'request': request})
        return Response(full.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def experiences_list(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Forbidden'}, status=403)

    if request.method == 'GET':
        serializer = BabysitterExperienceSerializer(request.user.experiences.all(), many=True)
        return Response(serializer.data)

    serializer = BabysitterExperienceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(babysitter=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def experience_detail(request, pk):
    try:
        exp = BabysitterExperience.objects.get(pk=pk, babysitter=request.user)
    except BabysitterExperience.DoesNotExist:
        return Response({'detail': 'Não encontrado.'}, status=404)

    if request.method == 'PUT':
        serializer = BabysitterExperienceSerializer(exp, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    exp.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def schedule(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Forbidden'}, status=403)

    if request.method == 'GET':
        serializer = BabysitterScheduleSerializer(request.user.schedules.all(), many=True)
        return Response(serializer.data)

    request.user.schedules.all().delete()
    created = []
    for item in request.data:
        serializer = BabysitterScheduleSerializer(data=item)
        if serializer.is_valid():
            obj = serializer.save(babysitter=request.user)
            created.append(BabysitterScheduleSerializer(obj).data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(created)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def trainings_list(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Forbidden'}, status=403)

    if request.method == 'GET':
        serializer = BabysitterTrainingSerializer(request.user.trainings.all(), many=True)
        return Response(serializer.data)

    serializer = BabysitterTrainingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(babysitter=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def training_detail(request, pk):
    try:
        training = BabysitterTraining.objects.get(pk=pk, babysitter=request.user)
    except BabysitterTraining.DoesNotExist:
        return Response({'detail': 'Não encontrado.'}, status=404)

    training.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def behavior(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Forbidden'}, status=403)

    obj, _ = BabysitterBehavior.objects.get_or_create(babysitter=request.user)

    if request.method == 'GET':
        return Response(BabysitterBehaviorSerializer(obj).data)

    serializer = BabysitterBehaviorSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def activities(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Forbidden'}, status=403)

    obj, _ = BabysitterActivities.objects.get_or_create(babysitter=request.user)

    if request.method == 'GET':
        return Response(BabysitterActivitiesSerializer(obj).data)

    serializer = BabysitterActivitiesSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def personal_traits(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Forbidden'}, status=403)

    obj, _ = BabysitterPersonalTraits.objects.get_or_create(babysitter=request.user)

    if request.method == 'GET':
        return Response(BabysitterPersonalTraitsSerializer(obj).data)

    serializer = BabysitterPersonalTraitsSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, babysitter_id):
    if request.user.user_type != 'contractor':
        return Response({'detail': 'Apenas contratantes podem avaliar.'}, status=403)

    try:
        babysitter = User.objects.get(id=babysitter_id, user_type='babysitter')
    except User.DoesNotExist:
        return Response({'detail': 'Babá não encontrada.'}, status=404)

    rating = request.data.get('rating')
    comment = request.data.get('comment', '')

    if not rating or not (1 <= int(rating) <= 5):
        return Response({'detail': 'Avaliação deve ser entre 1 e 5.'}, status=400)

    review = BabysitterReview.objects.create(
        babysitter=babysitter,
        reviewer=request.user,
        rating=int(rating),
        comment=comment,
    )
    serializer = BabysitterReviewSerializer(review, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)
