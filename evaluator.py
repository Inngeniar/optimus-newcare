"""
evaluator.py
Motor de cálculo matemático para el Análisis GAP del Programa NEWCARE.
Implementa el algoritmo de calificación inspirado en la herramienta ISO 9001:2015 del usuario,
con soporte para ponderación diferenciada (Capítulo 5 = 25%, Capítulo 8 = 15%) y ponderación simple.
"""

from typing import Dict, List, Any

def evaluate_group(group_cfg: Dict[str, Any], items: List[Dict[str, Any]], target_pct: float = 90.0) -> Dict[str, Any]:
    """
    Evalúa un grupo específico de requisitos.
    Escala:
      2 = Cumple Completo (100% de los puntos de ese requisito)
      1 = Cumple Parcial (50% de los puntos)
      0 = No Cumple (0% de los puntos)
      'NA' = No Aplica (se excluye del denominador)
    """
    total_items = len(items)
    count_2 = 0
    count_1 = 0
    count_0 = 0
    count_na = 0
    
    points_obtained = 0.0
    
    for item in items:
        score = item.get("score", 0)
        if score == "NA" or score == "N":
            count_na += 1
        elif score == 2 or score == "2":
            count_2 += 1
            points_obtained += 2.0
        elif score == 1 or score == "1":
            count_1 += 1
            points_obtained += 1.0
        else:  # 0 or unrecognized
            count_0 += 1
            points_obtained += 0.0
            
    applicable_items = total_items - count_na
    max_points = applicable_items * 2.0
    
    if max_points > 0:
        compliance_pct = round((points_obtained / max_points) * 100.0, 1)
    else:
        compliance_pct = 100.0
        
    gap_pct = round(100.0 - compliance_pct, 1)
    target_gap = round(max(0.0, target_pct - compliance_pct), 1)
    
    if compliance_pct >= target_pct:
        status_code = "OPTIMO"
        status_label = "Óptimo (Cumple Meta)"
        color = "#10B981"  # Emerald Green
    elif compliance_pct >= 70.0:
        status_code = "EN_DESARROLLO"
        status_label = "En Desarrollo"
        color = "#F59E0B"  # Amber
    else:
        status_code = "CRITICO"
        status_label = "Brecha Crítica"
        color = "#EF4444"  # Red
        
    return {
        "group_id": group_cfg["id"],
        "code": group_cfg["code"],
        "name": group_cfg["name"],
        "short_name": group_cfg["short_name"],
        "icon": group_cfg["icon"],
        "weight_differential": group_cfg["weight_differential"],
        "weight_equal": group_cfg["weight_equal"],
        "total_items": total_items,
        "applicable_items": applicable_items,
        "count_completo": count_2,
        "count_parcial": count_1,
        "count_no_cumple": count_0,
        "count_na": count_na,
        "points_obtained": points_obtained,
        "max_points": max_points,
        "compliance_pct": compliance_pct,
        "gap_pct": gap_pct,
        "target_pct": target_pct,
        "target_gap": target_gap,
        "status_code": status_code,
        "status_label": status_label,
        "color": color
    }

def evaluate_all(groups_cfg: List[Dict[str, Any]], items_master: List[Dict[str, Any]], 
                 use_differential_weight: bool = True, target_pct: float = 90.0) -> Dict[str, Any]:
    """
    Calcula el diagnóstico global combinando todos los grupos.
    """
    # Mapear items por grupo
    items_by_group = {g["id"]: [] for g in groups_cfg}
    for item in items_master:
        gid = item.get("group_id")
        if gid in items_by_group:
            items_by_group[gid].append(item)
            
    group_results = []
    total_points = 0.0
    total_max_points = 0.0
    
    weighted_sum = 0.0
    total_weight = 0.0
    
    total_completo = 0
    total_parcial = 0
    total_no_cumple = 0
    total_na = 0
    total_items = len(items_master)
    
    critical_gaps = []
    
    for g in groups_cfg:
        g_items = items_by_group.get(g["id"], [])
        res = evaluate_group(g, g_items, target_pct=target_pct)
        group_results.append(res)
        
        total_points += res["points_obtained"]
        total_max_points += res["max_points"]
        total_completo += res["count_completo"]
        total_parcial += res["count_parcial"]
        total_no_cumple += res["count_no_cumple"]
        total_na += res["count_na"]
        
        weight = g["weight_differential"] if use_differential_weight else g["weight_equal"]
        weighted_sum += res["compliance_pct"] * weight
        total_weight += weight
        
        # Identificar brechas críticas en este grupo
        for it in g_items:
            s = it.get("score", 0)
            if s == 0 or s == "0":
                critical_gaps.append({
                    "item_id": it["id"],
                    "code": it["code"],
                    "group_code": g["code"],
                    "group_name": g["short_name"],
                    "title": it["title"],
                    "requirement": it["requirement"],
                    "audit_criterion": it["audit_criterion"],
                    "severity": "ALTA (No Cumple)",
                    "action": it.get("action", it.get("default_action", "")),
                    "responsible": it.get("responsible", it.get("default_responsible", "")),
                    "priority": it.get("priority", "Alta")
                })
            elif (s == 1 or s == "1") and g["id"] in ["G4", "G5", "G8", "G10"]:
                critical_gaps.append({
                    "item_id": it["id"],
                    "code": it["code"],
                    "group_code": g["code"],
                    "group_name": g["short_name"],
                    "title": it["title"],
                    "requirement": it["requirement"],
                    "audit_criterion": it["audit_criterion"],
                    "severity": "MEDIA (Cumple Parcial en Cap. Estratégico)",
                    "action": it.get("action", it.get("default_action", "")),
                    "responsible": it.get("responsible", it.get("default_responsible", "")),
                    "priority": it.get("priority", "Media")
                })

    global_compliance = round(weighted_sum / total_weight, 1) if total_weight > 0 else 0.0
    global_gap = round(100.0 - global_compliance, 1)
    
    # Diagnóstico de preparación de certificación
    # Verificamos si los capítulos clave (5 y 8) tienen un mínimo aceptable
    cap5_res = next((r for r in group_results if r["group_id"] == "G5"), None)
    cap8_res = next((r for r in group_results if r["group_id"] == "G8"), None)
    
    cap5_ok = cap5_res["compliance_pct"] >= 75.0 if cap5_res else True
    cap8_ok = cap8_res["compliance_pct"] >= 70.0 if cap8_res else True
    
    if global_compliance >= 90.0 and cap5_ok and cap8_ok:
        verdict_code = "CERTIFICABLE"
        verdict_title = "🏆 NIVEL CERTIFICABLE NEWCARE"
        verdict_desc = "Optimus Health IPS cumple con los estándares de excelencia requeridos para la Auditoría Presencial de Certificación por la Fundación New Health."
        verdict_color = "#10B981"  # Green
        badge_class = "success"
    elif global_compliance >= 80.0 and (cap5_res["compliance_pct"] >= 65.0 if cap5_res else True):
        verdict_code = "INFORME_FAVORABLE"
        verdict_title = "📑 APTO PARA INFORME FAVORABLE"
        verdict_desc = "La entidad cuenta con el modelo teórico y procedimental necesario para recibir el Informe Favorable y dar entrada a pacientes bajo seguimiento."
        verdict_color = "#3B82F6"  # Blue
        badge_class = "info"
    elif global_compliance >= 60.0:
        verdict_code = "EN_IMPLANTACION"
        verdict_title = "⚠️ FASE DE IMPLANTACIÓN AVANZADA"
        verdict_desc = "Existen avances significativos en el modelo general y asistencial, pero persisten brechas críticas en medición, gobernanza y planes de mejora que deben cerrarse."
        verdict_color = "#F59E0B"  # Amber
        badge_class = "warning"
    else:
        verdict_code = "DIAGNOSTICO_INICIAL"
        verdict_title = "🚨 ETAPA DE DIAGNÓSTICO INICIAL"
        verdict_desc = "El programa presenta una brecha global superior al 40%. Se requiere desplegar de manera inmediata los planes de acción en los capítulos pendientes."
        verdict_color = "#EF4444"  # Red
        badge_class = "danger"

    return {
        "global_compliance": global_compliance,
        "global_gap": global_gap,
        "target_pct": target_pct,
        "target_gap": round(max(0.0, target_pct - global_compliance), 1),
        "use_differential_weight": use_differential_weight,
        "verdict_code": verdict_code,
        "verdict_title": verdict_title,
        "verdict_desc": verdict_desc,
        "verdict_color": verdict_color,
        "badge_class": badge_class,
        "total_items": total_items,
        "total_completo": total_completo,
        "total_parcial": total_parcial,
        "total_no_cumple": total_no_cumple,
        "total_na": total_na,
        "total_points": total_points,
        "total_max_points": total_max_points,
        "groups": group_results,
        "critical_gaps": critical_gaps,
        "critical_gaps_count": len(critical_gaps)
    }