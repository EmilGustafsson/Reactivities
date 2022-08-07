using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {
        
    }

    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly DataContext _dbcontext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public IsHostRequirementHandler(DataContext dbcontext, IHttpContextAccessor httpContextAccessor )
        {
            this._dbcontext = dbcontext;
            this._httpContextAccessor = httpContextAccessor;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Task.CompletedTask;
            var activityId = Guid.Parse(_httpContextAccessor.HttpContext?.Request.RouteValues.SingleOrDefault(x => x.Key == "id").Value?.ToString());
            var atteende = _dbcontext.ActivityAttendees.AsNoTracking().SingleOrDefaultAsync(x => x.AppUserId == userId && x.ActivityId == activityId).Result;
            if (atteende == null) return Task.CompletedTask;
            if (atteende.IsHost) context.Succeed(requirement);
            return Task.CompletedTask;
        }
    }
}