from rest_framework import serializers

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


class BabysitterProfileSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = BabysitterProfile
        fields = ['bio', 'title', 'linkedin', 'housing_available', 'completion_percentage']
        read_only_fields = ['completion_percentage']


class BabysitterExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BabysitterExperience
        fields = [
            'id', 'title', 'employer',
            'start_date', 'end_date', 'is_current',
            'description', 'age_ranges',
        ]


class BabysitterScheduleSerializer(serializers.ModelSerializer):
    day_label = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = BabysitterSchedule
        fields = ['id', 'day_of_week', 'day_label', 'morning', 'afternoon', 'evening', 'overnight']


class BabysitterTrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BabysitterTraining
        fields = ['id', 'title', 'description', 'completed']


class BabysitterBehaviorSerializer(serializers.ModelSerializer):
    class Meta:
        model = BabysitterBehavior
        fields = [
            'family_orientation', 'playtime', 'flexibility',
            'parent_communication', 'daily_routine', 'situation_dilemma',
        ]


class BabysitterActivitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BabysitterActivities
        fields = [
            'reading', 'educational_toys', 'outdoor', 'social_skills',
            'arts', 'cooking', 'music', 'crafts',
        ]


class BabysitterPersonalTraitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BabysitterPersonalTraits
        fields = ['organized', 'patient', 'creative', 'attentive', 'playful', 'bio_quote']


class ReviewerSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'profile_picture_url']

    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        url = obj.profile_picture_url
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class BabysitterReviewSerializer(serializers.ModelSerializer):
    reviewer = ReviewerSerializer(read_only=True)

    class Meta:
        model = BabysitterReview
        fields = ['id', 'reviewer', 'rating', 'comment', 'created_at']


class BabysitterPublicProfileSerializer(serializers.Serializer):
    """Full profile for any viewer (own profile or public)."""
    id = serializers.IntegerField(source='user.id')
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    profile_picture_url = serializers.SerializerMethodField()
    city = serializers.CharField(source='user.city')
    state = serializers.CharField(source='user.state')
    zip_code = serializers.CharField(source='user.zip_code')
    phone = serializers.CharField(source='user.phone')
    bio = serializers.CharField()
    title = serializers.CharField()
    linkedin = serializers.CharField(allow_blank=True, required=False)
    housing_available = serializers.BooleanField()
    cpf_verified = serializers.SerializerMethodField()
    documentation_verified = serializers.SerializerMethodField()
    completion_percentage = serializers.IntegerField()
    experiences = serializers.SerializerMethodField()
    schedules = serializers.SerializerMethodField()
    trainings = serializers.SerializerMethodField()
    behavior = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()
    personal_traits = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        url = obj.user.profile_picture_url
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    def get_cpf_verified(self, obj):
        return bool(getattr(obj.user, 'cpf_validated', False))

    def get_documentation_verified(self, obj):
        return bool(getattr(obj.user, 'cpf_validated', False))

    def get_experiences(self, obj):
        return BabysitterExperienceSerializer(
            obj.user.experiences.all(), many=True
        ).data

    def get_schedules(self, obj):
        return BabysitterScheduleSerializer(
            obj.user.schedules.all(), many=True
        ).data

    def get_trainings(self, obj):
        return BabysitterTrainingSerializer(
            obj.user.trainings.all(), many=True
        ).data

    def get_behavior(self, obj):
        try:
            return BabysitterBehaviorSerializer(obj.user.behavior).data
        except Exception:
            return None

    def get_activities(self, obj):
        try:
            return BabysitterActivitiesSerializer(obj.user.activities).data
        except Exception:
            return None

    def get_personal_traits(self, obj):
        try:
            return BabysitterPersonalTraitsSerializer(obj.user.personal_traits).data
        except Exception:
            return None

    def get_reviews(self, obj):
        return BabysitterReviewSerializer(
            obj.user.received_reviews.all()[:10],
            many=True,
            context=self.context,
        ).data

    def get_average_rating(self, obj):
        reviews = obj.user.received_reviews.all()
        if not reviews.exists():
            return None
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    def get_review_count(self, obj):
        return obj.user.received_reviews.count()
