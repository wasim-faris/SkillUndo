from .models import Skill, UserSkill

def get_all_skills():
    """
    return all skills
    """
    return Skill.objects.all()

def add_skill_to_user(user, skill_id, skill_type):
    """
    Adds a skill to user.
    Returns created Userskills.
    """
    skill = Skill.objects.get(id=skill_id)
    user_skill = UserSkill.objects.create(
        user=user,
        skill=skill,
        skill_type = skill_type
    )
    return user_skill

def remove_skill_from_user(user, skill_id):
    """
    Remove a skill from user
    """
    skill = UserSkill.objects.filter(
        user=user,
        id=skill_id
    ).delete()

def get_user_skills(user):
    """
    Return all Skill of a user
    """
    return UserSkill.objects.select_related('skill').filter(user=user)

def get_matches_for_user(user):
    """
    Find users whose teach skill match
    current users learn skills and vice versea
    """
    
    #means what current user want to learn in this one
    user_want = UserSkill.objects.filter(
        user=user,
        skill_type = 'learn'
    ).values_list('skill_id', flat=True)
    
    user_teaches = UserSkill.objects.filter(
        user=user,
        skill_type = 'teach'
    ).values_list('skill_id', flat=True)
    
    matched_user = UserSkill.objects.filter(
        user_skills__skill_id__in=user_want,
        user_skills___skill_type='teach'
    ).filter(
        user_skill__skill_id__in=user_teaches,
        user_skills__skill_type='learn'
    ).exclude(
        id=user.id
    ).select_related('user__profile').distinct()
    
    return matched_user