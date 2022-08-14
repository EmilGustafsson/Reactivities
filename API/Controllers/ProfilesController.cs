using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    public class ProfilesController : BaseApiController
    {
        [HttpGet("{username}")]
        public async Task<IActionResult> GetProfile(string username)
        {
            return HandleResult(await Mediator.Send(new Details.Query { Username = username}));
        }
        [HttpGet("{username}/activities")]
        public async Task<IActionResult> GetActivities(string username, string predicate)
        {
            return HandleResult(await Mediator.Send(new  ListActivities.Query { Username = username, Predicate = predicate}));
        }

    }
}