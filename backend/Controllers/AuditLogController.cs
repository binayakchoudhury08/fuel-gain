using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace PumpGainTracker.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAuditLogs()
        {
            var logs = new[]
            {
                new { Id = "log-101", Action = "Login", Details = "Authenticated from Android application.", Timestamp = DateTime.UtcNow.AddHours(-4).ToString("o") },
                new { Id = "log-102", Action = "Entry Created", Details = "Created MS entry for date 2026-07-27", Timestamp = DateTime.UtcNow.AddHours(-2).ToString("o") },
                new { Id = "log-103", Action = "Report Generated", Details = "Generated PDF report for MS", Timestamp = DateTime.UtcNow.AddHours(-1).ToString("o") }
            };

            return Ok(logs);
        }

        [HttpPost]
        public IActionResult PostAuditLog([FromBody] object logPayload)
        {
            return Ok(new { Status = "Logged", LogId = Guid.NewGuid().ToString() });
        }
    }
}
