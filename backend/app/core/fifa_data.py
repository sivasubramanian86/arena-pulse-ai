from typing import Any, Dict, List

# Static mock database for FIFA World Cup 2026 Matches & Venues
FIFA_VENUES: Dict[str, Dict[str, Any]]
FIFA_MATCHES: List[Dict[str, Any]]
# In a real-world scenario, this would query a third-party Sports API.
FIFA_VENUES = {
    "metlife": {
        "id": "metlife",
        "name": "MetLife Stadium",
        "city": "East Rutherford, New Jersey",
        "capacity": 82500,
        "matches_hosted": 8,
        "avg_crowd_density": 0.85
    },
    "sofi": {
        "id": "sofi",
        "name": "SoFi Stadium",
        "city": "Inglewood, California",
        "capacity": 70240,
        "matches_hosted": 7,
        "avg_crowd_density": 0.78
    },
    "att": {
        "id": "att",
        "name": "AT&T Stadium",
        "city": "Arlington, Texas",
        "capacity": 80000,
        "matches_hosted": 9,
        "avg_crowd_density": 0.82
    },
    "mercedes": {
        "id": "mercedes",
        "name": "Mercedes-Benz Stadium",
        "city": "Atlanta, Georgia",
        "capacity": 71000,
        "matches_hosted": 8,
        "avg_crowd_density": 0.74
    },
    "azteca": {
        "id": "azteca",
        "name": "Estadio Azteca",
        "city": "Mexico City, Mexico",
        "capacity": 87523,
        "matches_hosted": 6,
        "avg_crowd_density": 0.90
    },
    "bcplace": {
        "id": "bcplace",
        "name": "BC Place",
        "city": "Vancouver, Canada",
        "capacity": 54500,
        "matches_hosted": 7,
        "avg_crowd_density": 0.68
    }
}

FIFA_MATCHES = [
    # Round of 16 (Playoffs)
    {
        "id": "m-r16-1",
        "stage": "Round of 16",
        "home_team": "Argentina",
        "away_team": "Spain",
        "venue": "MetLife Stadium",
        "venue_id": "metlife",
        "status": "LIVE",
        "minute": 78,
        "home_score": 2,
        "away_score": 1,
        "date": "2026-07-19T12:00:00Z",
        "events": [
            {"time": 23, "type": "goal", "player": "Lionel Messi", "team": "Argentina"},
            {"time": 45, "type": "goal", "player": "Alvaro Morata", "team": "Spain"},
            {"time": 68, "type": "goal", "player": "Lautaro Martinez", "team": "Argentina"}
        ]
    },
    {
        "id": "m-r16-2",
        "stage": "Round of 16",
        "home_team": "Brazil",
        "away_team": "France",
        "venue": "SoFi Stadium",
        "venue_id": "sofi",
        "status": "SCHEDULED",
        "minute": 0,
        "home_score": 0,
        "away_score": 0,
        "date": "2026-07-20T18:00:00Z",
        "events": []
    },
    {
        "id": "m-r16-3",
        "stage": "Round of 16",
        "home_team": "Mexico",
        "away_team": "USA",
        "venue": "Estadio Azteca",
        "venue_id": "azteca",
        "status": "COMPLETED",
        "minute": 90,
        "home_score": 1,
        "away_score": 2,
        "date": "2026-07-18T20:00:00Z",
        "events": [
            {"time": 12, "type": "goal", "player": "Santiago Gimenez", "team": "Mexico"},
            {"time": 34, "type": "goal", "player": "Christian Pulisic", "team": "USA"},
            {"time": 88, "type": "goal", "player": "Timothy Weah", "team": "USA"}
        ]
    },
    # Semi-Finals
    {
        "id": "m-sf-1",
        "stage": "Semi-Final",
        "home_team": "Winner of R16-1 (Argentina/Spain)",
        "away_team": "Winner of R16-2 (Brazil/France)",
        "venue": "AT&T Stadium",
        "venue_id": "att",
        "status": "SCHEDULED",
        "minute": 0,
        "home_score": 0,
        "away_score": 0,
        "date": "2026-07-23T20:00:00Z",
        "events": []
    },
    {
        "id": "m-sf-2",
        "stage": "Semi-Final",
        "home_team": "England",
        "away_team": "Germany",
        "venue": "Mercedes-Benz Stadium",
        "venue_id": "mercedes",
        "status": "SCHEDULED",
        "minute": 0,
        "home_score": 0,
        "away_score": 0,
        "date": "2026-07-24T20:00:00Z",
        "events": []
    },
    # World Cup Final
    {
        "id": "m-final",
        "stage": "Final",
        "home_team": "Winner of SF-1",
        "away_team": "Winner of SF-2",
        "venue": "MetLife Stadium",
        "venue_id": "metlife",
        "status": "SCHEDULED",
        "minute": 0,
        "home_score": 0,
        "away_score": 0,
        "date": "2026-07-29T20:00:00Z",
        "events": []
    }
]

class FIFAMatchEngine:
    """RAG-enabled search and retrieval engine for live FIFA World Cup 2026 fixtures."""

    @staticmethod
    def get_all_matches() -> List[Dict[str, Any]]:
        return FIFA_MATCHES

    @staticmethod
    def get_all_venues() -> Dict[str, Dict[str, Any]]:
        return FIFA_VENUES

    @staticmethod
    def search_matches(query: str) -> List[Dict[str, Any]]:
        """Filters matches based on keyword search matching teams, venues, or stages."""
        cleaned_query = query.lower()
        results = []
        for m in FIFA_MATCHES:
            if (cleaned_query in m["home_team"].lower() or
                cleaned_query in m["away_team"].lower() or
                cleaned_query in m["venue"].lower() or
                cleaned_query in m["stage"].lower() or
                cleaned_query in m["status"].lower()):
                results.append(m)
        return results

    @staticmethod
    def query_fifa_context(query: str) -> str:
        """Constructs an XML context block summarizing relevant match and venue data."""
        matched_matches = FIFAMatchEngine.search_matches(query)
        # If no specific matches found, dump all scheduled upcoming games
        if not matched_matches:
            matched_matches = FIFA_MATCHES

        context_lines = ["<FIFA_WORLD_CUP_2026_CONTEXT>"]

        # Matches info
        context_lines.append("  <MATCHES>")
        for m in matched_matches:
            score_str = f"{m['home_score']}-{m['away_score']}" if m["status"] in ["LIVE", "COMPLETED"] else "N/A"
            min_str = f" ({m['minute']}th min)" if m["status"] == "LIVE" else ""
            context_lines.append(
                f"    <MATCH id='{m['id']}' stage='{m['stage']}' status='{m['status']}'>"
                f"      <TEAMS>{m['home_team']} vs {m['away_team']}</TEAMS>"
                f"      <SCORE>{score_str}</SCORE>"
                f"      <TIME>{m['date']}{min_str}</TIME>"
                f"      <VENUE>{m['venue']} (ID: {m['venue_id']})</VENUE>"
            )
            if m["events"]:
                context_lines.append("      <EVENTS>")
                for event in m["events"]:
                    context_lines.append(f"        <EVENT minute='{event['time']}' type='{event['type']}' player='{event['player']}' team='{event['team']}' />")
                context_lines.append("      </EVENTS>")
            context_lines.append("    </MATCH>")
        context_lines.append("  </MATCHES>")

        # Venues info
        context_lines.append("  <VENUES>")
        for v_id, v in FIFA_VENUES.items():
            if v["name"].lower() in query.lower() or any(m["venue_id"] == v_id for m in matched_matches):
                context_lines.append(
                    f"    <VENUE id='{v['id']}'>"
                    f"      <NAME>{v['name']}</NAME>"
                    f"      <LOCATION>{v['city']}</LOCATION>"
                    f"      <CAPACITY>{v['capacity']}</CAPACITY>"
                    f"      <CROWD_DENSITY>{v['avg_crowd_density']}</CROWD_DENSITY>"
                    f"    </VENUE>"
                )
        context_lines.append("  </VENUES>")

        context_lines.append("</FIFA_WORLD_CUP_2026_CONTEXT>")
        return "\n".join(context_lines)
