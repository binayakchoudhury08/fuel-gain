using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PumpGainTracker.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PumpTrackerController : ControllerBase
    {
        [HttpGet("companies")]
        public IActionResult GetCompanies()
        {
            var companies = new[]
            {
                new { Id = "11111111-1111-1111-1111-111111111111", Name = "Hindustan Petroleum (HPCL)", Code = "HPCL" },
                new { Id = "22222222-2222-2222-2222-222222222222", Name = "Indian Oil (IOCL)", Code = "IOCL" },
                new { Id = "33333333-3333-3333-3333-333333333333", Name = "Bharat Petroleum (BPCL)", Code = "BPCL" },
                new { Id = "44444444-4444-4444-4444-444444444444", Name = "Shell", Code = "Shell" },
                new { Id = "55555555-5555-5555-5555-555555555555", Name = "Jio-bp", Code = "Jio-bp" },
                new { Id = "66666666-6666-6666-6666-666666666666", Name = "Nayara Energy", Code = "Nayara" }
            };
            return Ok(companies);
        }

        [HttpGet("products/{companyCode}")]
        public IActionResult GetProductsByCompany(string companyCode)
        {
            var productMap = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                { "HPCL", new[] { "MS", "HSD", "Power95", "Power100" } },
                { "IOCL", new[] { "MS", "HSD", "XP95", "XP100" } },
                { "BPCL", new[] { "MS", "HSD", "Speed", "Speed97", "Speed100" } },
                { "Shell", new[] { "Shell Unleaded 95", "Shell V-Power 97", "Shell Diesel" } },
                { "Jio-bp", new[] { "Petrol", "Diesel", "ACTIVE Premium Petrol" } },
                { "Nayara", new[] { "MS", "HSD" } }
            };

            if (productMap.TryGetValue(companyCode, out var products))
            {
                return Ok(new { Company = companyCode, Products = products });
            }

            return NotFound(new { Message = $"Company '{companyCode}' not found." });
        }

        [HttpGet("kpis")]
        public IActionResult GetKpiStats()
        {
            return Ok(new
            {
                TotalEntries = 1248,
                TodayGainLiters = "+142.50 L",
                TodayShortageLiters = "-18.20 L",
                ReportsGenerated = 94,
                PdfDownloads = 312
            });
        }
    }
}
