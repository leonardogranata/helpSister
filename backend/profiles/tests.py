from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from profiles.models import (
    BabysitterActivities,
    BabysitterExperience,
    BabysitterPersonalTraits,
    BabysitterProfile,
    BabysitterReview,
    BabysitterSchedule,
)


class PublicBabysitterDiscoveryTests(APITestCase):
    def setUp(self):
        self.contractor = User.objects.create_user(
            username='contractor@example.com',
            email='contractor@example.com',
            password='senha-segura',
            first_name='Carla',
            last_name='Souza',
            user_type='contractor',
        )
        self.babysitter = User.objects.create_user(
            username='baba@example.com',
            email='baba@example.com',
            password='senha-segura',
            first_name='Ana',
            last_name='Silva',
            user_type='babysitter',
            city='Sao Paulo',
            state='SP',
            zip_code='01000-000',
            phone='11999999999',
        )

    def test_public_list_returns_registered_babysitters(self):
        response = self.client.get(reverse('babysitter-public-profiles-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.babysitter.id)
        self.assertEqual(response.data[0]['name'], 'Ana Silva')
        self.assertEqual(response.data[0]['city'], 'Sao Paulo')

    def test_public_list_exposes_fields_needed_for_filters(self):
        BabysitterProfile.objects.create(
            user=self.babysitter,
            bio='Cuido de criancas com muito carinho e rotina organizada.',
            title='Babá com experiência escolar',
            housing_available=True,
        )
        BabysitterExperience.objects.create(
            babysitter=self.babysitter,
            title='Babá',
            employer='Familia Lima',
            start_date='2024-01-01',
            description='Acompanhamento diario e apoio escolar.',
            age_ranges=['3-6', '7-10'],
        )
        BabysitterSchedule.objects.create(
            babysitter=self.babysitter,
            day_of_week=0,
            morning=True,
            afternoon=True,
        )
        BabysitterActivities.objects.create(
            babysitter=self.babysitter,
            reading=True,
            outdoor=True,
        )
        BabysitterPersonalTraits.objects.create(
            babysitter=self.babysitter,
            organized=5,
            patient=4,
            creative=4,
            attentive=5,
            playful=3,
            bio_quote='Cuidado com afeto e previsibilidade.',
        )
        BabysitterReview.objects.create(
            babysitter=self.babysitter,
            reviewer=self.contractor,
            rating=5,
            comment='Excelente com as criancas.',
        )

        response = self.client.get(reverse('babysitter-public-profiles-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        babysitter = response.data[0]
        self.assertTrue(babysitter['housing_available'])
        self.assertEqual(babysitter['schedules'][0]['day_of_week'], 0)
        self.assertTrue(babysitter['activities']['reading'])
        self.assertEqual(babysitter['personal_traits']['organized'], 5)
        self.assertEqual(babysitter['experiences'][0]['age_ranges'], ['3-6', '7-10'])
        self.assertEqual(babysitter['average_rating'], 5.0)
        self.assertEqual(babysitter['review_count'], 1)
