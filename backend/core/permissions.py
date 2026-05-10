from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    message = "you dont have permissont to access this one"
    
    def has_object_permission(self, request, view, obj):
       return obj.user == request.user
   
   
class IsSessionParticipant(BasePermission):
    message = "you are not part of this session"
    
    def has_object_permission(self, request, view, obj):
        return request.user in [obj.sender , obj.receiver]