from django.db import models
from core.base_model import BaseModel
from apps.users.models import User


class SkillCategory(models.TextChoices):
    CODING = 'coding', 'Coding'
    DESIGN = 'design', 'Design'
    MUSIC = 'music', 'Music'
    LANGUAGE = 'language', 'Language'
    BUSINESS = 'business', 'Business'
    OTHER = 'other', 'Other'


class Skill(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(
        max_length=20,
        choices=SkillCategory.choices,
        db_index=True
    )

    class Meta:
        db_table = 'skills'
        ordering = ['name']

    def __str__(self):
        return self.name


class UserSkill(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_skills',
        db_index=True
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='user_skills',
        db_index=True
    )
    skill_type = models.CharField(
        max_length=10,
        choices=[
            ('teach', 'Teach'),
            ('learn', 'Learn')
        ],
        db_index=True
    )

    class Meta:
        db_table = 'user_skills'
        unique_together = ['user', 'skill', 'skill_type']

    def __str__(self):
        return f"{self.user.email} - {self.skill.name} - {self.skill_type}"