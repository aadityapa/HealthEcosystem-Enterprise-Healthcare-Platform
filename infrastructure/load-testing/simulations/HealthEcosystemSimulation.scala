package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

/**
 * HealthEcosystem load simulation stub.
 * Extend with full scenario chains once Gatling is wired into CI.
 */
class HealthEcosystemSimulation extends Simulation {

  val baseUrl: String = sys.env.getOrElse("BASE_URL", "http://localhost:3000")

  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("HealthEcosystem-Gatling/1.0")

  val healthCheck = scenario("Gateway Health")
    .exec(
      http("Live Probe")
        .get("/health/live")
        .check(status.is(200))
    )
    .pause(1.second)
    .exec(
      http("Ready Probe")
        .get("/health/ready")
        .check(status.is(200))
    )

  val authFlow = scenario("Auth Login")
    .exec(
      http("Login")
        .post("/api/v1/auth/login")
        .body(StringBody("""{"email":"admin@demolab.com","password":"Admin@123456","tenantSlug":"demo-lab"}"""))
        .check(status.is(200))
        .check(jsonPath("$.data.accessToken").saveAs("accessToken"))
    )

  setUp(
    healthCheck.inject(rampUsers(10).during(30.seconds)),
    authFlow.inject(constantUsersPerSec(5).during(1.minute))
  ).protocols(httpProtocol)
    .assertions(
      global.successfulRequests.percent.gt(99),
      global.responseTime.percentile3.lt(500)
    )
}
