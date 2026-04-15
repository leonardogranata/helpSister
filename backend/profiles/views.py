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


# ─── Public profile ──────────────────────────────────────────────────────────

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


# ─── My profile ──────────────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def babysitter_my_profile(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Apenas babás podem acessar este endpoint.'}, status=403)

    profile = _get_or_create_profile(request.user)

    if request.method == 'GET':
        serializer = BabysitterPublicProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    # PATCH – update bio / title / linkedin / housing_available
    serializer = BabysitterProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        full = BabysitterPublicProfileSerializer(profile, context={'request': request})
        return Response(full.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Experiences ─────────────────────────────────────────────────────────────

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


# ─── Schedule ────────────────────────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def schedule(request):
    if request.user.user_type != 'babysitter':
        return Response({'detail': 'Forbidden'}, status=403)

    if request.method == 'GET':
        serializer = BabysitterScheduleSerializer(request.user.schedules.all(), many=True)
        return Response(serializer.data)

    # PUT: replace all schedule entries
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


# ─── Trainings ───────────────────────────────────────────────────────────────

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


# ─── Behavior ────────────────────────────────────────────────────────────────

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


# ─── Activities ──────────────────────────────────────────────────────────────

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


# ─── Personal Traits ─────────────────────────────────────────────────────────

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


# ─── Reviews ─────────────────────────────────────────────────────────────────

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
