using Microsoft.AspNetCore.Mvc;
using System;

namespace PumpGainTracker.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiInsightsController : ControllerBase
    {
        [HttpGet("prediction")]
        public IActionResult GetGainPrediction()
        {
            return Ok(new
            {
                ExpectedTomorrowGainLiters = 14.5,
                ConfidencePercentage = 93,
                Recommendation = "Optimal fuel gain efficiency. Maintain current nozzle calibration schedule."
            });
        }

        [HttpPost("ocr-parse-dipchart")]
        public IActionResult ParseDipChartOcr()
        {
            return Ok(new
            {
                Status = "Success",
                ExtractedCalibrationPointsCount = 20,
                RatioLitersPerMm = 8.51
            });
        }
    }
}
