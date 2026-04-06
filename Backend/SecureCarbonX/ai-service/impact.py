"""
SecureCarbonX - Environmental Impact Calculation Engine
"""

from typing import Dict, Any, List
from shared_types import Detection

def calculate_impact(activity: str, detections: List[Detection]) -> Dict[str, Any]:
    """
    Calculates the estimated environmental impact based on the detected activity.

    These values are simplified for demonstration purposes.
    """
    impact_data = {
        "metric": "N/A",
        "value": 0,
        "unit": "",
        "narrative": "No specific environmental impact could be quantified for this activity."
    }

    if activity == "tree_planting":
        # Assumption: One verified photo event corresponds to one sapling planted.
        # A young tree sequesters ~2.5 kg of CO2 annually.
        num_plants = sum(1 for d in detections if d.label in {"plant", "tree", "plant-on-ground"})
        count = max(1, num_plants)
        co2_offset = count * 2.5
        impact_data = {
            "metric": "CO2 Sequestration",
            "value": round(co2_offset, 2),
            "unit": "kg/year",
            "narrative": f"This action is equivalent to planting {count} tree(s), sequestering an estimated {co2_offset:.2f} kg of CO2 per year over the next decade."
        }

    elif activity == "cycling":
        # Assumption: A cycling trip saves ~0.4 kg of CO2 per mile vs. a car.
        # If we see multiple bicycles, we assume a group activity.
        num_bikes = sum(1 for d in detections if d.label == "bicycle")
        count = max(1, num_bikes)
        co2_saved = count * 1.25 # Assuming 3.1 miles per bike avg
        impact_data = {
            "metric": "CO2 Emissions Avoided",
            "value": round(co2_saved, 2),
            "unit": "kg",
            "narrative": f"By choosing cycling over fossil-fuel transport for {count} person(s), an estimated {co2_saved:.2f} kg of CO2 emissions were avoided."
        }

    elif activity == "reusable_usage":
        # Assumption: Using a reusable bottle avoids one 15g plastic bottle.
        num_bottles = sum(1 for d in detections if d.label == "bottle")
        count = max(1, num_bottles)
        plastic_saved = count * 15
        impact_data = {
            "metric": "Plastic Waste Avoided",
            "value": round(plastic_saved, 2),
            "unit": "grams",
            "narrative": f"Using {count} reusable container(s) successfully avoided approximately {plastic_saved} grams of single-use plastic waste."
        }

    elif activity == "waste_sorting":
        # Assumption: Each sorted bottle avoids ~25g of plastic waste and reduces CO2.
        num_bottles = sum(1 for d in detections if d.label == "bottle")
        count = max(1, num_bottles)
        plastic_saved = count * 25
        co2_equivalent = count * 0.1 # ~100g CO2 per recycled bottle
        impact_data = {
            "metric": "Recycling Impact",
            "value": round(plastic_saved, 2),
            "unit": "grams",
            "narrative": f"Sorting {count} plastic bottle(s) for recycling has prevented {plastic_saved}g of plastic waste and avoided {co2_equivalent:.2f}kg of CO2 equivalent."
        }

    elif activity == "sustainability_action":
        # Generic positive environmental action.
        co2_equivalent = 0.5
        impact_data = {
            "metric": "Carbon Footprint Reduction",
            "value": round(co2_equivalent, 2),
            "unit": "kg CO2e",
            "narrative": f"This sustainability action contributes to a lower carbon footprint, with an estimated equivalent of {co2_equivalent} kg of CO2 saved."
        }


    return impact_data
