"""
app.py
Aplicación Principal Streamlit: GAP Analysis NewCare - Optimus Health IPS.
Diseñada para evaluar el cumplimiento de los 13 grupos de requisitos del programa NewCare
frente a los estándares de la Fundación New Health, basada en la metodología de análisis GAP de ISO 9001:2015.
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, List, Any
import datetime

from requirements_data import GROUPS_CONFIG, REQUIREMENTS_MASTER
from evaluator import evaluate_all, evaluate_group
import storage
import importlib
importlib.reload(storage)
from export_excel import generate_excel_report
import export_reports

# ----------------------------------------------------
# CONFIGURACIÓN DE PÁGINA
# ----------------------------------------------------
st.set_page_config(
    page_title="GAP Analysis NewCare | Optimus Health IPS",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ----------------------------------------------------
# ESTILOS CSS PERSONALIZADOS (PALETA CORPORATIVA)
# ----------------------------------------------------
st.markdown("""
<style>
    /* Tipografía y colores base */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    /* Ocultar botón Deploy y decoraciones de Streamlit Cloud */
    .stAppDeployButton, header [data-testid="stToolbar"] {
        display: none !important;
    }
    #MainMenu {
        visibility: hidden;
    }
    footer {
        visibility: hidden;
    }
    
    /* Encabezado principal */
    .brand-header {
        background: linear-gradient(135deg, #0F766E 0%, #1E293B 100%);
        color: white;
        padding: 24px 32px;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }
    .brand-title {
        font-size: 26px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.5px;
    }
    .brand-subtitle {
        font-size: 14px;
        opacity: 0.9;
        margin-top: 6px;
        font-weight: 400;
    }
    .brand-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 10px;
    }

    /* Tarjetas KPI */
    .kpi-card {
        background: white;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 18px 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    }
    .kpi-value {
        font-size: 32px;
        font-weight: 800;
        line-height: 1.1;
        margin-top: 8px;
    }
    .kpi-label {
        font-size: 13px;
        color: #64748B;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .kpi-sub {
        font-size: 12px;
        color: #94A3B8;
        margin-top: 4px;
    }

    /* Veredicto de certificación */
    .verdict-box {
        padding: 20px 24px;
        border-radius: 12px;
        margin-bottom: 24px;
        border-left: 6px solid;
    }
    .verdict-box.success {
        background: #ECFDF5;
        border-color: #10B981;
        color: #065F46;
    }
    .verdict-box.info {
        background: #EFF6FF;
        border-color: #3B82F6;
        color: #1E40AF;
    }
    .verdict-box.warning {
        background: #FFFBEB;
        border-color: #F59E0B;
        color: #92400E;
    }
    .verdict-box.danger {
        background: #FEF2F2;
        border-color: #EF4444;
        color: #991B1B;
    }

    /* Tarjeta de Requisito */
    .req-card {
        background: white;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 18px 20px;
        margin-bottom: 16px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }
    .req-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #F1F5F9;
        padding-bottom: 10px;
        margin-bottom: 12px;
    }
    .req-code {
        background: #F1F5F9;
        color: #334155;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 12px;
    }
    .badge-score-2 {
        background: #D1FAE5;
        color: #065F46;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
    }
    .badge-score-1 {
        background: #FEF3C7;
        color: #92400E;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
    }
    .badge-score-0 {
        background: #FEE2E2;
        color: #991B1B;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
    }
    .badge-score-na {
        background: #F1F5F9;
        color: #64748B;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
    }
</style>
""", unsafe_allow_html=True)

# ----------------------------------------------------
# CONTROL DE SEGURIDAD Y ACCESO CORPORATIVO (GATEKEEPER)
# ----------------------------------------------------
def check_authentication():
    if "authenticated" not in st.session_state:
        st.session_state["authenticated"] = False

    if not st.session_state["authenticated"]:
        st.markdown("""
        <div style="background: linear-gradient(135deg, #0F766E 0%, #1E293B 100%); color: white; padding: 32px 24px; border-radius: 16px; text-align: center; max-width: 520px; margin: 40px auto 20px auto; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <div style="font-size: 44px; margin-bottom: 8px;">🔒</div>
            <h2 style="margin: 0; color: white; font-weight: 700; font-size: 24px;">Optimus Health IPS</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">GAP Analysis NewCare | Sistema de Acreditación y Baremación</p>
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 12px; margin-top: 12px; font-weight: 600;">ACCESO CONFIDENCIAL RESTRINGIDO</div>
        </div>
        """, unsafe_allow_html=True)

        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            with st.form("login_gatekeeper_form"):
                st.markdown("<p style='font-size: 14px; color: #475569; font-weight: 500; margin-bottom: 4px;'>Ingrese la clave autorizada para desbloquear:</p>", unsafe_allow_html=True)
                input_pwd = st.text_input("Clave de Acceso", type="password", label_visibility="collapsed", placeholder="Contraseña corporativa...")
                submitted = st.form_submit_button("🔓 Acceder al Sistema", use_container_width=True)

                if submitted:
                    valid_keys = ["OPTIMUS-2026", "MSM-IA-2026"]
                    secret_key = st.secrets.get("OPTIMUS_PASSWORD", None)
                    if secret_key:
                        valid_keys.append(secret_key)

                    if input_pwd in valid_keys:
                        st.session_state["authenticated"] = True
                        st.success("✅ Acceso autorizado. Cargando...")
                        st.rerun()
                    else:
                        st.error("❌ Contraseña incorrecta. Acceso restringido.")

            st.markdown("<p style='text-align: center; color: #64748b; font-size: 12px; margin-top: 16px;'>Optimus Health IPS &bull; Fundación New Health &bull; Sede Sincelejo</p>", unsafe_allow_html=True)
        st.stop()

check_authentication()

# ----------------------------------------------------
# CARGA Y GESTIÓN DEL ESTADO EN SESIÓN
# ----------------------------------------------------
if "assessment_items" not in st.session_state:
    st.session_state.assessment_items = storage.load_assessment_data()

if "target_pct" not in st.session_state:
    st.session_state.target_pct = 90.0

if "weight_mode" not in st.session_state:
    st.session_state.weight_mode = "Ponderación Diferenciada (Cap 5=25%, Cap 8=15%)"

# ----------------------------------------------------
# SIDEBAR (BARRA LATERAL DE CONTROL)
# ----------------------------------------------------
with st.sidebar:
    st.markdown("### 🏥 OPTIMUS HEALTH IPS")
    st.markdown("**Programa NEWCARE**")
    st.markdown("<small>Certificación por Fundación New Health</small>", unsafe_allow_html=True)
    st.markdown("---")
    
    # Navegación
    menu = st.radio(
        "Navegación del Sistema:",
        [
            "📊 Panel Ejecutivo (Dashboard)",
            "📝 Estudio de Evaluación GAP",
            "🎯 Plan de Mejora Continua",
            "🔍 Simulador de Auditoría",
            "📁 Repositorio Documental Central",
            "📚 Manual y Referencias",
            "📥 Exportar y Reportes"
        ],
        index=0
    )
    st.markdown("---")
    
    # Configuración metodológica
    st.markdown("#### ⚙️ Parámetros de Calificación")
    weight_choice = st.selectbox(
        "Metodología de Ponderación:",
        [
            "Ponderación Diferenciada (Cap 5=25%, Cap 8=15%)",
            "Ponderación Simple Equitativa (ISO Estándar)"
        ],
        index=0 if "Diferenciada" in st.session_state.weight_mode else 1
    )
    st.session_state.weight_mode = weight_choice
    use_differential = "Diferenciada" in weight_choice
    
    target_slider = st.slider(
        "Meta de Certificación (%):",
        min_value=70.0,
        max_value=100.0,
        value=float(st.session_state.target_pct),
        step=5.0
    )
    st.session_state.target_pct = target_slider
    
    st.markdown("---")
    st.markdown("#### 🔄 Gestión de Datos")
    
    col_s1, col_s2 = st.columns(2)
    with col_s1:
        if st.button("💾 Guardar", use_container_width=True, help="Guarda cambios en el archivo local"):
            storage.save_assessment_data(st.session_state.assessment_items)
            st.success("Guardado exitoso")
    with col_s2:
        if st.button("↺ Base", use_container_width=True, help="Restaura la línea base diagnóstica inicial"):
            st.session_state.assessment_items = storage.reset_to_baseline()
            st.rerun()

    if st.button("🧹 Limpiar Todo (0%)", use_container_width=True):
        st.session_state.assessment_items = storage.reset_to_empty()
        st.rerun()

    if st.button("🏆 Simular 100% Cumple", use_container_width=True):
        st.session_state.assessment_items = storage.set_all_to_compliant()
        st.rerun()

    st.markdown("---")
    if st.button("🔒 Bloquear / Salir", use_container_width=True):
        st.session_state["authenticated"] = False
        st.rerun()

    st.markdown("<small style='color:#64748B;'>Versión 2.0 • Sede Sincelejo, Sucre<br>Diseñado para Optimus Health IPS</small>", unsafe_allow_html=True)

# ----------------------------------------------------
# CÁLCULO DINÁMICO DE RESULTADOS
# ----------------------------------------------------
eval_res = evaluate_all(
    groups_cfg=GROUPS_CONFIG,
    items_master=st.session_state.assessment_items,
    use_differential_weight=use_differential,
    target_pct=st.session_state.target_pct
)

# ----------------------------------------------------
# ENCABEZADO SUPERIOR COMÚN
# ----------------------------------------------------
st.markdown("""
<div class="brand-header">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
            <div class="brand-title">OPTIMUS HEALTH IPS  •  GAP ANALYSIS NEWCARE</div>
            <div class="brand-subtitle">Herramienta de Verificación y Diagnóstico para la Certificación del Programa de Cronicidad Compleja (IOCC)</div>
        </div>
        <div>
            <span class="brand-badge">📍 Sede Sincelejo</span>
            <span class="brand-badge">🏛️ Fundación New Health</span>
            <span class="brand-badge">📐 Metodología GAP ISO 9001:2015</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ====================================================
# PESTAÑA 1: DASHBOARD EJECUTIVO
# ====================================================
if menu == "📊 Panel Ejecutivo (Dashboard)":
    st.markdown("### 📊 Tablero de Mando y Diagnóstico Global de Cumplimiento")
    
    # 1. Fila de Tarjetas KPI
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        color_kpi = eval_res["verdict_color"]
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Cumplimiento Global</div>
            <div class="kpi-value" style="color: {color_kpi};">{eval_res['global_compliance']}%</div>
            <div class="kpi-sub">Ponderación {'Diferenciada' if use_differential else 'Equitativa'}</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col2:
        gap_color = "#DC2626" if eval_res['global_gap'] > 20 else "#F59E0B"
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Brecha Global (GAP)</div>
            <div class="kpi-value" style="color: {gap_color};">{eval_res['global_gap']}%</div>
            <div class="kpi-sub">Faltante para el 100%</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Meta Certificación</div>
            <div class="kpi-value" style="color: #0F766E;">{eval_res['target_pct']}%</div>
            <div class="kpi-sub">Brecha a la meta: {eval_res['target_gap']}%</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Requisitos Conformes</div>
            <div class="kpi-value" style="color: #10B981;">{eval_res['total_completo']}<span style="font-size:16px; color:#94A3B8;">/{eval_res['total_items']}</span></div>
            <div class="kpi-sub">🟢 {eval_res['total_completo']}  |  🟡 {eval_res['total_parcial']}  |  🔴 {eval_res['total_no_cumple']}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    
    # 2. Veredicto de Auditoría
    st.markdown(f"""
    <div class="verdict-box {eval_res['badge_class']}">
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">{eval_res['verdict_title']}</div>
        <div style="font-size: 14px; line-height: 1.5;">{eval_res['verdict_desc']}</div>
    </div>
    """, unsafe_allow_html=True)

    # 3. Gráficos Ejecutivos: Radar Spider Chart + Barras Horizontales
    col_g1, col_g2 = st.columns([1, 1])
    
    with col_g1:
        st.markdown("#### 🕸️ Radar de Cumplimiento por Capítulo (Spider Chart)")
        
        categories = [g["code"] for g in eval_res["groups"]]
        scores = [g["compliance_pct"] for g in eval_res["groups"]]
        targets = [eval_res["target_pct"]] * len(categories)
        
        # Cerrar el radar circular
        categories_closed = categories + [categories[0]]
        scores_closed = scores + [scores[0]]
        targets_closed = targets + [targets[0]]
        
        fig_radar = go.Figure()
        
        # Área de Meta
        fig_radar.add_trace(go.Scatterpolar(
            r=targets_closed,
            theta=categories_closed,
            mode='lines',
            name=f'Meta ({eval_res["target_pct"]}%)',
            line=dict(color='rgba(15, 118, 110, 0.6)', dash='dash', width=2),
            fill=None
        ))
        
        # Área de Cumplimiento Real
        fig_radar.add_trace(go.Scatterpolar(
            r=scores_closed,
            theta=categories_closed,
            mode='lines+markers',
            name='Cumplimiento Actual',
            line=dict(color='#0F766E', width=3),
            fill='toself',
            fillcolor='rgba(15, 118, 110, 0.25)',
            marker=dict(size=6, color='#1E293B')
        ))
        
        fig_radar.update_layout(
            polar=dict(
                radialaxis=dict(visible=True, range=[0, 100], ticksuffix="%"),
            ),
            showlegend=True,
            legend=dict(orientation="h", yanchor="bottom", y=1.05, xanchor="right", x=1),
            margin=dict(l=30, r=30, t=30, b=30),
            height=380
        )
        st.plotly_chart(fig_radar, use_container_width=True)

    with col_g2:
        st.markdown("#### 📊 Nivel de Cumplimiento vs Brecha por Capítulo")
        
        df_bars = pd.DataFrame([
            {
                "Capítulo": g["short_name"],
                "Cumplimiento": g["compliance_pct"],
                "Brecha": g["gap_pct"],
                "Color": g["color"],
                "Code": g["code"]
            }
            for g in eval_res["groups"]
        ])
        
        fig_bar = px.bar(
            df_bars,
            x="Cumplimiento",
            y="Capítulo",
            orientation="h",
            text="Cumplimiento",
            color="Cumplimiento",
            color_continuous_scale=[[0, "#EF4444"], [0.7, "#F59E0B"], [0.9, "#10B981"], [1.0, "#059669"]],
            range_color=[0, 100],
            height=380
        )
        fig_bar.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
        fig_bar.add_vline(x=eval_res["target_pct"], line_dash="dash", line_color="#0F766E", annotation_text="Meta")
        fig_bar.update_layout(
            xaxis=dict(range=[0, 115], ticksuffix="%"),
            yaxis=dict(autorange="reversed"),
            coloraxis_showscale=False,
            margin=dict(l=10, r=20, t=20, b=20)
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    # 4. Resumen Tabular de los 13 Grupos Normativos
    st.markdown("#### 📋 Matriz de Resumen por los 13 Grupos Normativos")
    
    table_data = []
    for g in eval_res["groups"]:
        table_data.append({
            "Código": g["code"],
            "Capítulo Normativo NewCare": f"{g['icon']} {g['name']}",
            "Peso %": f"{g['weight_differential']}%" if use_differential else f"{g['weight_equal']:.1f}%",
            "Req.": g["total_items"],
            "🟢 Completo": g["count_completo"],
            "🟡 Parcial": g["count_parcial"],
            "🔴 No Cumple": g["count_no_cumple"],
            "⚪ NA": g["count_na"],
            "% Cumplimiento": f"{g['compliance_pct']}%",
            "Brecha (GAP)": f"{g['gap_pct']}%",
            "Estado": g["status_label"]
        })
    df_table = pd.DataFrame(table_data)
    st.dataframe(df_table, use_container_width=True, hide_index=True)

    # 5. Brechas Críticas que Bloquean la Certificación
    st.markdown("---")
    st.markdown(f"#### 🚨 Brechas Críticas para la Certificación ({eval_res['critical_gaps_count']} hallazgos prioritarios)")
    
    if eval_res["critical_gaps"]:
        st.info("Los siguientes requisitos se encuentran en **No Cumple (0%)** o con **Cumplimiento Parcial** en capítulos neurálgicos (5. Atención, 8. Indicadores, 4. Gobernanza y 10. Mejora). Requieren acción inmediata:")
        
        crit_data = []
        for cg in eval_res["critical_gaps"][:15]:  # Top 15
            crit_data.append({
                "Capítulo": cg["group_code"],
                "Req.": cg["code"],
                "Título": cg["title"],
                "Severidad": cg["severity"],
                "Acción Inmediata Sugerida": cg["action"],
                "Responsable": cg["responsible"],
                "Prioridad": cg["priority"]
            })
        st.dataframe(pd.DataFrame(crit_data), use_container_width=True, hide_index=True)
    else:
        st.success("¡Excelente! No se identifican brechas críticas ni requisitos en 'No Cumple'.")

# ====================================================
# PESTAÑA 2: ESTUDIO DE EVALUACIÓN GAP
# ====================================================
elif menu == "📝 Estudio de Evaluación GAP":
    st.markdown("### 📝 Evaluación Detallada Requisito por Requisito")
    st.markdown("Selecciona el capítulo a auditar. Al calificar cada requisito se recalculará automáticamente la puntuación y podrás documentar las evidencias y tareas de mejora.")
    
    # Selector de grupo
    group_options = {g["id"]: f"{g['code']} - {g['name']}" for g in GROUPS_CONFIG}
    selected_gid = st.selectbox(
        "Seleccionar Capítulo / Grupo Normativo:",
        options=list(group_options.keys()),
        format_func=lambda x: group_options[x]
    )
    
    curr_group = next((g for g in eval_res["groups"] if g["group_id"] == selected_gid), None)
    curr_group_cfg = next((g for g in GROUPS_CONFIG if g["id"] == selected_gid), None)
    
    # Encabezado del grupo seleccionado
    col_ch1, col_ch2, col_ch3 = st.columns([2, 1, 1])
    with col_ch1:
        st.markdown(f"#### {curr_group_cfg['icon']} {curr_group_cfg['name']}")
        st.markdown(f"<p style='color:#64748B;'>{curr_group_cfg['description']}</p>", unsafe_allow_html=True)
    with col_ch2:
        st.metric(
            label="Cumplimiento del Capítulo",
            value=f"{curr_group['compliance_pct']}%",
            delta=f"-{curr_group['gap_pct']}% Brecha",
            delta_color="inverse"
        )
    with col_ch3:
        st.metric(
            label="Peso en Calificación Global",
            value=f"{curr_group['weight_differential']}%" if use_differential else f"{curr_group['weight_equal']:.1f}%",
            help="Capítulo 5 (25%) y Capítulo 8 (15%) tienen mayor ponderación estratégica."
        )

    # Filtros de visualización
    filter_status = st.radio(
        "Filtrar requisitos del capítulo:",
        ["Todos", "Solo con Brecha (0 y 1)", "Solo No Cumple (0)", "Solo Cumple Parcial (1)", "Solo Cumple Completo (2)"],
        horizontal=True
    )

    # Obtener ítems del grupo
    group_items = [it for it in st.session_state.assessment_items if it.get("group_id") == selected_gid]
    
    # Aplicar filtro
    if filter_status == "Solo con Brecha (0 y 1)":
        display_items = [it for it in group_items if it.get("score") in [0, 1, "0", "1"]]
    elif filter_status == "Solo No Cumple (0)":
        display_items = [it for it in group_items if it.get("score") in [0, "0"]]
    elif filter_status == "Solo Cumple Parcial (1)":
        display_items = [it for it in group_items if it.get("score") in [1, "1"]]
    elif filter_status == "Solo Cumple Completo (2)":
        display_items = [it for it in group_items if it.get("score") in [2, "2"]]
    else:
        display_items = group_items

    st.markdown(f"**Mostrando {len(display_items)} de {len(group_items)} requisitos:**")

    # Renderizar cada requisito
    for it in display_items:
        it_id = it["id"]
        curr_score = it.get("score", 0)
        
        # Determinar badge
        if curr_score == 2 or curr_score == "2":
            badge_html = "<span class='badge-score-2'>🟢 Cumple Completo (2 pts)</span>"
        elif curr_score == 1 or curr_score == "1":
            badge_html = "<span class='badge-score-1'>🟡 Cumple Parcial (1 pt)</span>"
        elif curr_score == "NA" or curr_score == "N":
            badge_html = "<span class='badge-score-na'>⚪ No Aplica (NA)</span>"
        else:
            badge_html = "<span class='badge-score-0'>🔴 No Cumple (0 pts)</span>"

        with st.container():
            st.markdown(f"""
            <div class="req-card">
                <div class="req-header">
                    <div>
                        <span class="req-code">Cód. {it['code']}</span>
                        <strong style="margin-left:8px; font-size:15px; color:#1E293B;">{it['title']}</strong>
                    </div>
                    <div>
                        <span style="font-size:12px; color:#64748B; margin-right:10px;">Fase: {it.get('phase', 'Certificación')}</span>
                        {badge_html}
                    </div>
                </div>
                <div style="font-size:14px; color:#334155; line-height:1.5; margin-bottom:12px;">
                    <strong>Requisito Normativo:</strong> {it['requirement']}
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            # Bloque interactivo de calificación
            c_rate, c_info = st.columns([1, 1])
            with c_rate:
                score_opts = ["0 - No Cumple", "1 - Cumple Parcial", "2 - Cumple Completo", "NA - No Aplica"]
                # Mapear valor actual
                if curr_score == 2 or curr_score == "2":
                    def_idx = 2
                elif curr_score == 1 or curr_score == "1":
                    def_idx = 1
                elif curr_score in ["NA", "N"]:
                    def_idx = 3
                else:
                    def_idx = 0
                    
                selected_score_str = st.radio(
                    f"Calificación para {it['code']}:",
                    score_opts,
                    index=def_idx,
                    key=f"score_radio_{it_id}",
                    horizontal=True
                )
                
                # Guardar nuevo score
                new_score_val = 0
                if "2" in selected_score_str:
                    new_score_val = 2
                elif "1" in selected_score_str:
                    new_score_val = 1
                elif "NA" in selected_score_str:
                    new_score_val = "NA"
                else:
                    new_score_val = 0
                    
                if it.get("score") != new_score_val:
                    it["score"] = new_score_val
                    storage.save_assessment_data(st.session_state.assessment_items)
                    st.rerun()

            with c_info:
                with st.expander("🔍 Criterio de Verificación de New Health y Soporte"):
                    st.markdown(f"**Qué audita New Health:** {it['audit_criterion']}")
                    st.markdown(f"**Referencia en Optimus Health:** `{it.get('reference_source', 'Manual Interno')}`")

            # Formulario desplegable para Evidencias y Tareas
            with st.expander(f"📝 Evidencias Documentales y Plan de Acción ({it['code']})", expanded=(curr_score in [0, 1, "0", "1"])):
                ce1, ce2 = st.columns(2)
                with ce1:
                    ev_text = st.text_area(
                        "Evidencia Documental Existente / Soporte Verificable:",
                        value=it.get("evidence", ""),
                        key=f"ev_{it_id}",
                        placeholder="Ej. Manual interno pág. 15, historia clínica #..., acta de junta...",
                        height=85
                    )
                    if ev_text != it.get("evidence", ""):
                        it["evidence"] = ev_text
                        storage.save_assessment_data(st.session_state.assessment_items)
                    
                    # --- Subida interactiva de archivos de soporte ---
                    uploaded_doc = st.file_uploader(
                        f"📎 Cargar archivo de soporte para {it['code']}:",
                        type=["pdf", "docx", "doc", "xlsx", "xls", "pptx", "png", "jpg", "jpeg"],
                        key=f"upload_{it_id}",
                        help="Sube actas, contratos, baremos, guías clínicas, imágenes o manuales."
                    )
                    if uploaded_doc is not None:
                        # Verificar si ya se guardó en esta sesión para evitar duplicar escrituras
                        upload_key = f"uploaded_flag_{it_id}_{uploaded_doc.name}"
                        if not st.session_state.get(upload_key, False):
                            saved_info = storage.save_uploaded_evidence(it_id, uploaded_doc)
                            st.session_state[upload_key] = True
                            
                            # Si la caja de texto no tiene el nombre, anexarlo automáticamente
                            ref_tag = f"📎 Archivo adjunto: {saved_info['original_name']}"
                            if ref_tag not in it.get("evidence", ""):
                                current_ev = it.get("evidence", "").strip()
                                it["evidence"] = f"{current_ev}\n{ref_tag}".strip() if current_ev else ref_tag
                                storage.save_assessment_data(st.session_state.assessment_items)
                            st.success(f"✅ Archivo '{uploaded_doc.name}' cargado con éxito ({saved_info['size_kb']} KB).")
                            st.rerun()

                    # Mostrar lista de archivos físicos ya adjuntados para este requisito
                    attached_files = storage.get_evidence_files(it_id)
                    if attached_files:
                        st.markdown("<small><b>📁 Archivos adjuntos en el repositorio:</b></small>", unsafe_allow_html=True)
                        for af in attached_files:
                            col_f1, col_f2 = st.columns([3, 1])
                            with col_f1:
                                st.markdown(f"<small>📄 <b>{af['original_name']}</b> ({af['size_kb']} KB)</small>", unsafe_allow_html=True)
                            with col_f2:
                                # Botón de descarga directa
                                try:
                                    with open(af["filepath"], "rb") as f_down:
                                        st.download_button(
                                            label="⬇️ Abrir",
                                            data=f_down.read(),
                                            file_name=af["original_name"],
                                            key=f"dl_{af['filename']}",
                                            use_container_width=True
                                        )
                                except Exception:
                                    pass
                        
                    # Vincular documento del Repositorio Central si existen
                    all_central = storage.get_central_documents()
                    if all_central:
                        c_opts = ["(Seleccionar documento central...)"] + [f"{d['original_name']} [{d['category']}]" for d in all_central]
                        sel_c = st.selectbox(
                            "🔗 O vincular documento maestro del Repositorio Central:",
                            options=c_opts,
                            key=f"link_central_{it_id}",
                            help="Vincula directamente el Manual Consolidado o Instructivos Generales a este requisito."
                        )
                        if sel_c != "(Seleccionar documento central...)":
                            doc_title = sel_c.split(" [")[0]
                            c_tag = f"📘 Doc. Central: {doc_title}"
                            if c_tag not in it.get("evidence", ""):
                                if st.button(f"➕ Asociar '{doc_title}' como evidencia", key=f"btn_c_{it_id}"):
                                    current_ev = it.get("evidence", "").strip()
                                    it["evidence"] = f"{current_ev}\n{c_tag}".strip() if current_ev else c_tag
                                    storage.save_assessment_data(st.session_state.assessment_items)
                                    st.success(f"Asociado '{doc_title}'")
                                    st.rerun()
                                    
                with ce2:
                    find_text = st.text_area(
                        "Hallazgo / Brecha identificada (GAP):",
                        value=it.get("findings", ""),
                        key=f"find_{it_id}",
                        placeholder="Ej. Falta formalizar el documento, pendiente firmas...",
                        height=100
                    )
                    if find_text != it.get("findings", ""):
                        it["findings"] = find_text
                        storage.save_assessment_data(st.session_state.assessment_items)

                ca1, ca2, ca3, ca4 = st.columns([2, 1, 1, 1])
                with ca1:
                    act_text = st.text_input(
                        "Acción Correctiva / Plan de Trabajo para Cerrar Brecha:",
                        value=it.get("action", ""),
                        key=f"act_{it_id}",
                        placeholder="Tarea específica a realizar..."
                    )
                    if act_text != it.get("action", ""):
                        it["action"] = act_text
                        storage.save_assessment_data(st.session_state.assessment_items)
                with ca2:
                    resp_text = st.text_input(
                        "Responsable:",
                        value=it.get("responsible", ""),
                        key=f"resp_{it_id}"
                    )
                    if resp_text != it.get("responsible", ""):
                        it["responsible"] = resp_text
                        storage.save_assessment_data(st.session_state.assessment_items)
                with ca3:
                    prio_opts = ["Alta", "Media", "Baja"]
                    curr_prio = it.get("priority", "Media")
                    idx_p = prio_opts.index(curr_prio) if curr_prio in prio_opts else 1
                    sel_prio = st.selectbox("Prioridad:", prio_opts, index=idx_p, key=f"prio_{it_id}")
                    if sel_prio != it.get("priority"):
                        it["priority"] = sel_prio
                        storage.save_assessment_data(st.session_state.assessment_items)
                with ca4:
                    stat_opts = ["Pendiente", "En Proceso", "Implementado"]
                    curr_stat = it.get("status", "Pendiente")
                    idx_s = stat_opts.index(curr_stat) if curr_stat in stat_opts else 0
                    sel_stat = st.selectbox("Estado Tarea:", stat_opts, index=idx_s, key=f"stat_{it_id}")
                    if sel_stat != it.get("status"):
                        it["status"] = sel_stat
                        storage.save_assessment_data(st.session_state.assessment_items)
            st.markdown("<hr style='margin:16px 0; border:0; border-top:1px dashed #E2E8F0;'>", unsafe_allow_html=True)

# ====================================================
# PESTAÑA 3: PLAN DE MEJORA CONTINUA (ACTION TRACKER)
# ====================================================
elif menu == "🎯 Plan de Mejora Continua":
    st.markdown("### 🎯 Plan de Mejora Continua y Cierre de Brechas (GAP)")
    st.markdown("Hoja de ruta priorizada para subsanar los requisitos con calificación de **No Cumple (0%)** o **Cumple Parcial (50%)**, asegurando la preparación de Optimus Health para la auditoría de New Health.")
    
    # Filtrar ítems con brecha
    gap_items = [it for it in st.session_state.assessment_items if it.get("score") in [0, 1, "0", "1"]]
    
    # Estadísticas de acciones
    pendientes = len([it for it in gap_items if it.get("status") == "Pendiente"])
    en_proceso = len([it for it in gap_items if it.get("status") == "En Proceso"])
    implementados = len([it for it in gap_items if it.get("status") == "Implementado"])
    
    c_m1, c_m2, c_m3, c_m4 = st.columns(4)
    with c_m1:
        st.metric("Total Tareas de Mejora", len(gap_items))
    with c_m2:
        st.metric("🔴 Pendientes", pendientes)
    with c_m3:
        st.metric("🟡 En Proceso", en_proceso)
    with c_m4:
        st.metric("🟢 Implementadas", implementados)
        
    st.markdown("<br>", unsafe_allow_html=True)

    # Selector de Formato de Visualización
    c_v1, c_v2 = st.columns([3, 2])
    with c_v1:
        search_kw = st.text_input("🔍 Buscar por palabra clave:", placeholder="Buscar en requisitos, hallazgos, responsables...", key="kw_search")
    with c_v2:
        view_mode = st.radio(
            "Modo de Visualización:",
            ["🗂️ Fichas de Acción Detalladas (Texto Completo)", "📑 Agrupado por Capítulos (Acordeón)", "📊 Tabla Resumen Multilínea"],
            horizontal=False,
            key="vm_radio"
        )
        
    # Filtros avanzados
    col_f1, col_f2, col_f3, col_f4 = st.columns(4)
    with col_f1:
        cap_opts = ["Todos los Capítulos"] + [f"{g['code']} - {g['short_name']}" for g in GROUPS_CONFIG]
        sel_cap = st.selectbox("Capítulo:", cap_opts)
    with col_f2:
        resp_list = ["Todos los Responsables"] + sorted(list(set([it.get("responsible", "Sin asignar") for it in gap_items if it.get("responsible")])))
        sel_resp = st.selectbox("Responsable:", resp_list)
    with col_f3:
        sel_prio = st.selectbox("Prioridad:", ["Todas", "Alta", "Media", "Baja"])
    with col_f4:
        sel_stat = st.selectbox("Estado de Tarea:", ["Todos", "Pendiente", "En Proceso", "Implementado"])

    # Filtrar
    filtered_items = gap_items
    if search_kw:
        kw = search_kw.lower()
        filtered_items = [
            it for it in filtered_items
            if kw in it.get("title", "").lower()
            or kw in it.get("findings", "").lower()
            or kw in it.get("action", "").lower()
            or kw in it.get("code", "").lower()
            or kw in it.get("responsible", "").lower()
        ]
    if sel_cap != "Todos los Capítulos":
        cap_code = sel_cap.split(" - ")[0]
        gid = next((g["id"] for g in GROUPS_CONFIG if g["code"] == cap_code), None)
        if gid:
            filtered_items = [it for it in filtered_items if it.get("group_id") == gid]
    if sel_resp != "Todos los Responsables":
        filtered_items = [it for it in filtered_items if it.get("responsible") == sel_resp]
    if sel_prio != "Todas":
        filtered_items = [it for it in filtered_items if it.get("priority") == sel_prio]
    if sel_stat != "Todos":
        filtered_items = [it for it in filtered_items if it.get("status") == sel_stat]

    st.markdown(f"**Mostrando {len(filtered_items)} tareas de mejora:**")
    st.markdown("---")

    # MODO 1: FICHAS DE ACCIÓN DETALLADAS
    if view_mode == "🗂️ Fichas de Acción Detalladas (Texto Completo)":
        if not filtered_items:
            st.info("No se encontraron acciones que coincidan con los filtros.")
        else:
            for it in filtered_items:
                it_id = it["id"]
                sc = it.get("score", 0)
                sc_badge = "🔴 No Cumple (0 pts)" if sc in [0, "0"] else "🟡 Cumple Parcial (1 pt)"
                sc_border = "#EF4444" if sc in [0, "0"] else "#F59E0B"
                sc_bg = "#FEF2F2" if sc in [0, "0"] else "#FFFBEB"
                prio = it.get("priority", "Media")
                prio_color = "#DC2626" if prio == "Alta" else "#D97706" if prio == "Media" else "#2563EB"
                g_meta = next((g for g in GROUPS_CONFIG if g["id"] == it.get("group_id")), {"name": "", "icon": "📋"})

                st.markdown(f'''
                <div style="background:white; border:1px solid #CBD5E1; border-left:6px solid {sc_border}; border-radius:10px; padding:18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; border-bottom:1px solid #F1F5F9; padding-bottom:8px; margin-bottom:10px;">
                        <div>
                            <span style="background:#1E293B; color:white; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:11px;">{g_meta['icon']} {it.get('group_id')} • Requisito {it['code']}</span>
                            <span style="font-size:15.5px; font-weight:700; color:#0F172A; margin-left:8px;">{it['title']}</span>
                        </div>
                        <div style="margin-top:4px;">
                            <span style="background:{sc_bg}; color:{sc_border}; font-weight:bold; padding:4px 10px; border-radius:12px; font-size:11px; margin-right:6px;">{sc_badge}</span>
                            <span style="background:#F1F5F9; color:{prio_color}; font-weight:bold; padding:4px 10px; border-radius:12px; font-size:11px;">Prioridad: {prio}</span>
                        </div>
                    </div>
                    <div style="font-size:13px; color:#475569; margin-bottom:12px; line-height:1.4;">
                        <strong>Requisito NewCare:</strong> {it['requirement']}
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:12px;">
                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px;">
                            <div style="font-size:11px; font-weight:bold; color:#64748B; text-transform:uppercase; margin-bottom:4px;">🔍 Hallazgo / Causa Raíz Detectada (GAP)</div>
                            <div style="font-size:13px; color:#1E293B; line-height:1.45;">{it.get('findings', it.get('default_findings', 'Sin hallazgo'))}</div>
                        </div>
                        <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:12px;">
                            <div style="font-size:11px; font-weight:bold; color:#065F46; text-transform:uppercase; margin-bottom:4px;">🎯 Plan de Acción Correctivo</div>
                            <div style="font-size:13px; color:#064E3B; font-weight:500; line-height:1.45;">{it.get('action', it.get('default_action', 'Sin acción formulada'))}</div>
                        </div>
                    </div>
                </div>
                ''', unsafe_allow_html=True)
                
                # Controles de estado y responsable
                col_c1, col_c2, col_c3 = st.columns([2, 1, 1])
                with col_c1:
                    st.caption(f"👤 **Responsable:** `{it.get('responsible', 'Sin asignar')}`   |   📁 **Soporte:** `{it.get('reference_source', 'Manual')}`")
                with col_c2:
                    current_s = it.get("status", "Pendiente")
                    new_s = st.selectbox(
                        "Estado de la tarea:",
                        ["Pendiente", "En Proceso", "Implementado"],
                        index=["Pendiente", "En Proceso", "Implementado"].index(current_s),
                        key=f"st_box_{it_id}"
                    )
                    if new_s != current_s:
                        it["status"] = new_s
                        storage.save_assessment_data(st.session_state.assessment_items)
                        st.rerun()
                with col_c3:
                    if it.get("status") == "Implementado":
                        if st.button("Marcar Cumplido (2 pts)", key=f"btn_done_{it_id}", help="Si la brecha fue subsanada, cambia la calificación a 2"):
                            it["score"] = 2
                            storage.save_assessment_data(st.session_state.assessment_items)
                            st.rerun()
                st.markdown("<hr style='margin:6px 0 16px 0; border:0; border-top:1px dashed #E2E8F0;'>", unsafe_allow_html=True)

    # MODO 2: AGRUPADO POR CAPÍTULOS (ACORDEÓN)
    elif view_mode == "📑 Agrupado por Capítulos (Acordeón)":
        groups_with_gaps = []
        for g in GROUPS_CONFIG:
            g_it = [it for it in filtered_items if it.get("group_id") == g["id"]]
            if g_it:
                groups_with_gaps.append((g, g_it))
                
        if not groups_with_gaps:
            st.info("No hay acciones de mejora para los filtros seleccionados.")
        else:
            for g_cfg, it_list in groups_with_gaps:
                with st.expander(f"{g_cfg['icon']} {g_cfg['name']} ({len(it_list)} tareas de mejora)", expanded=True):
                    for it in it_list:
                        it_id = it["id"]
                        sc = it.get("score", 0)
                        sc_tag = "🔴 No Cumple (0)" if sc in [0, "0"] else "🟡 Cumple Parcial (1)"
                        st.markdown(f"**Requisito {it['code']}: {it['title']}** — `{sc_tag}` | Prioridad: `{it.get('priority', 'Media')}`")
                        st.markdown(f"*Requisito:* {it['requirement']}")
                        
                        ca1, ca2 = st.columns(2)
                        with ca1:
                            st.markdown(f"**🔍 Hallazgo / GAP:**\n{it.get('findings', it.get('default_findings', ''))}")
                        with ca2:
                            st.markdown(f"**🎯 Plan de Acción:**\n{it.get('action', it.get('default_action', ''))}")
                            
                        cs1, cs2 = st.columns([2, 1])
                        with cs1:
                            st.caption(f"Responsable: **{it.get('responsible', 'Sin asignar')}**")
                        with cs2:
                            new_st = st.selectbox(
                                "Estado:",
                                ["Pendiente", "En Proceso", "Implementado"],
                                index=["Pendiente", "En Proceso", "Implementado"].index(it.get("status", "Pendiente")),
                                key=f"st_acc_{it_id}"
                            )
                            if new_st != it.get("status"):
                                it["status"] = new_st
                                storage.save_assessment_data(st.session_state.assessment_items)
                                st.rerun()
                        st.markdown("<hr style='margin:6px 0;'>", unsafe_allow_html=True)

    # MODO 3: TABLA RESUMEN CON TEXTO COMPLETO
    else:
        if not filtered_items:
            st.info("No hay acciones de mejora para los filtros seleccionados.")
        else:
            html_rows = ""
            for idx, it in enumerate(filtered_items):
                bg = "#F8FAFC" if idx % 2 == 0 else "#FFFFFF"
                sc = it.get("score", 0)
                prio = it.get("priority", "Media")
                prio_col = "#DC2626" if prio == "Alta" else "#D97706" if prio == "Media" else "#2563EB"
                stat = it.get("status", "Pendiente")
                stat_col = "#EF4444" if stat == "Pendiente" else "#F59E0B" if stat == "En Proceso" else "#10B981"
                
                html_rows += f'''
                <tr style="background:{bg}; vertical-align:top;">
                    <td style="padding:10px; border:1px solid #CBD5E1; font-weight:bold; color:#0F766E;">{it.get('code')}</td>
                    <td style="padding:10px; border:1px solid #CBD5E1; font-weight:600; color:#1E293B; line-height:1.4;">{it.get('title')}</td>
                    <td style="padding:10px; border:1px solid #CBD5E1; color:#334155; line-height:1.45;">{it.get('findings', it.get('default_findings', ''))}</td>
                    <td style="padding:10px; border:1px solid #CBD5E1; color:#064E3B; background:#F0FDF4; font-weight:500; line-height:1.45;">{it.get('action', it.get('default_action', ''))}</td>
                    <td style="padding:10px; border:1px solid #CBD5E1; color:#334155;">{it.get('responsible', it.get('default_responsible', 'Sin asignar'))}</td>
                    <td style="padding:10px; border:1px solid #CBD5E1; text-align:center; font-weight:bold; color:{prio_col};">{prio}</td>
                    <td style="padding:10px; border:1px solid #CBD5E1; text-align:center; font-weight:bold; color:{stat_col};">{stat}</td>
                </tr>
                '''
                
            full_html = f'''
            <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:13px; font-family:Inter, sans-serif;">
                <thead>
                    <tr style="background:#1E293B; color:white; text-align:left;">
                        <th style="padding:10px; border:1px solid #CBD5E1; width:70px;">Cód.</th>
                        <th style="padding:10px; border:1px solid #CBD5E1; width:180px;">Requisito</th>
                        <th style="padding:10px; border:1px solid #CBD5E1; width:290px;">Hallazgo / Causa Raíz Detectada (GAP)</th>
                        <th style="padding:10px; border:1px solid #CBD5E1; width:330px;">Plan de Acción Correctivo (Tarea)</th>
                        <th style="padding:10px; border:1px solid #CBD5E1; width:140px;">Responsable</th>
                        <th style="padding:10px; border:1px solid #CBD5E1; width:80px; text-align:center;">Prioridad</th>
                        <th style="padding:10px; border:1px solid #CBD5E1; width:95px; text-align:center;">Estado</th>
                    </tr>
                </thead>
                <tbody>{html_rows}</tbody>
            </table>
            </div>
            '''
            st.html(full_html)
# ====================================================
# PESTAÑA 4: SIMULADOR DE AUDITORÍA NEW HEALTH
# ====================================================
elif menu == "🔍 Simulador de Auditoría":
    st.markdown("### 🔍 Simulador y Verificador por Fases de Auditoría New Health")
    st.markdown("""
    La Fundación New Health evalúa a las entidades en dos grandes hitos de certificación:
    - **Fase 1: Informe Favorable:** Verifica la preparación del modelo teórico, el Manual interno de Optimus Health, organigramas, comités y flujogramas antes de atender pacientes.
    - **Fase 2: Certificación NEWCARE:** Auditoría presencial exhaustiva que verifica la operación real, PAI consensuados en historias clínicas, seguimiento y la malla de indicadores.
    """)
    
    phase_choice = st.radio(
        "Seleccionar Escenario de Auditoría a Simular:",
        ["Hito 1: Auditoría de Informe Favorable (Pre-operativa)", "Hito 2: Auditoría Presencial de Certificación NEWCARE"],
        horizontal=True
    )
    
    if "Informe Favorable" in phase_choice:
        phase_items = [it for it in st.session_state.assessment_items if "Informe Favorable" in it.get("phase", "")]
        st.markdown(f"#### 📑 Checklist Verificador: Auditoría de Informe Favorable ({len(phase_items)} requisitos)")
        
        # Calcular cumplimiento de fase
        pts_fase = sum([2.0 if it.get("score") in [2, "2"] else 1.0 if it.get("score") in [1, "1"] else 0.0 for it in phase_items if it.get("score") not in ["NA", "N"]])
        max_fase = len([it for it in phase_items if it.get("score") not in ["NA", "N"]]) * 2.0
        pct_fase = round((pts_fase / max_fase * 100.0), 1) if max_fase > 0 else 100.0
        
        col_ph1, col_ph2 = st.columns([1, 2])
        with col_ph1:
            st.metric("Cumplimiento Fase Informe Favorable", f"{pct_fase}%", delta=f"{pct_fase - 80.0:.1f}% vs Umbral 80%")
            if pct_fase >= 80.0:
                st.success("✅ APROBADO: Optimus Health está listo para superar la Auditoría de Informe Favorable.")
            else:
                st.warning(f"⚠️ PENDIENTE: Se requiere alcanzar mínimo el 80% (faltan {80.0 - pct_fase:.1f}%).")
        with col_ph2:
            st.info("""
            **Requisitos Clave que audita New Health en Informe Favorable:**
            1. Manual interno completamente redactado con Misión, DAFO, CAME y Objetivos.
            2. Ruta del paciente y flujograma formalizado.
            3. Organigrama específico y equipo multidisciplinar definido.
            4. Protocolo de VMD y criterios de derivación.
            5. Sistema INFORMEX iSSGS operativo.
            """)
            
        # Tabla de requisitos de la fase
        df_p = pd.DataFrame([
            {
                "Cód": it["code"],
                "Requisito": it["title"],
                "Calificación": "🟢 Cumple Completo" if it.get("score") in [2, "2"] else "🟡 Parcial" if it.get("score") in [1, "1"] else "🔴 No Cumple",
                "Evidencia Documental": it.get("evidence", ""),
                "Soporte": it.get("reference_source", "")
            }
            for it in phase_items
        ])
        st.dataframe(df_p, use_container_width=True, hide_index=True)
        
    else:
        st.markdown(f"#### 🏆 Checklist Verificador: Auditoría Presencial de Certificación NEWCARE ({len(st.session_state.assessment_items)} requisitos)")
        st.metric("Cumplimiento Global de Certificación", f"{eval_res['global_compliance']}%", delta=f"{eval_res['global_compliance'] - eval_res['target_pct']:.1f}% vs Meta {eval_res['target_pct']}%")
        
        if eval_res['verdict_code'] == "CERTIFICABLE":
            st.success("🏆 EXCELENTE: La organización cumple con los estándares para obtener el Sello de Certificación NEWCARE.")
        else:
            st.error("🚨 ATENCIÓN: Aún existen brechas críticas (Capítulo 8 Indicadores, 6 Marketing, 9 Burnout/Formación y 10 Auditoría Interna) que impedirían la certificación definitiva.")

# ====================================================
# PESTAÑA: REPOSITORIO DOCUMENTAL CENTRAL Y CARGA MASIVA
# ====================================================
elif menu == "📁 Repositorio Documental Central":
    st.markdown("### 📁 Repositorio Documental Central y Carga Transversal")
    st.markdown("Espacio unificado para almacenar manuales consolidados, instructivos oficiales de New Health, documentos de habilitación y anexos institucionales transversales a la auditoría.")

    tab_repo_view, tab_repo_upload = st.tabs(["📚 Documentos Maestros Disponibles", "📤 Cargar Nuevo Documento Maestro / Consolidado"])

    with tab_repo_upload:
        st.markdown("#### Subir Documento Maestro o Actualización Transversal")
        st.info("💡 **Uso recomendado:** Carga aquí el **Manual NewCare Consolidado (v2.0)**, **Instructivos de New Health**, **Guías de Habilitación**, o **Mallas de Indicadores** que apliquen a múltiples requisitos.")
        
        c_up1, c_up2 = st.columns([1, 1])
        with c_up1:
            category_choice = st.selectbox(
                "Categoría del Documento:",
                [
                    "📘 Manual del Recurso NewCare (Consolidado)",
                    "📋 Guía Metodológica e Instructivos New Health",
                    "⚖️ Marco Legal y Habilitación IPS",
                    "🩺 Guías de Práctica Clínica y Protocolos",
                    "📊 Malla de Indicadores y Registros",
                    "🤝 Redes Comunitarias y Voluntariado",
                    "📂 Anexos y Formatos Varios"
                ]
            )
            doc_notes = st.text_input("Descripción / Versión del Documento:", placeholder="Ej. Versión 2.0 aprobada por gerencia - Sept 2026")
        
        with c_up2:
            multi_files = st.file_uploader(
                "Seleccionar archivo(s) para el Repositorio Central:",
                type=["pdf", "docx", "doc", "xlsx", "xls", "pptx", "zip", "png", "jpg"],
                accept_multiple_files=True,
                key="central_upload_widget",
                help="Puedes seleccionar uno o varios documentos a la vez."
            )
            
            if multi_files:
                if st.button("🚀 Confirmar y Guardar en Repositorio Central", use_container_width=True):
                    count_saved = 0
                    for mf in multi_files:
                        storage.save_central_document(mf, category=category_choice, notes=doc_notes)
                        count_saved += 1
                    st.success(f"🎉 Se han cargado exitosamente {count_saved} documento(s) al Repositorio Central.")
                    st.rerun()

    with tab_repo_view:
        st.markdown("#### Documentos Registrados en el Repositorio de Optimus Health")
        central_docs = storage.get_central_documents()
        
        if central_docs:
            # Filtro por categoría
            cats = sorted(list(set(d["category"] for d in central_docs)))
            selected_cat = st.selectbox("Filtrar por Categoría:", ["Todas las Categorías"] + cats)
            
            filtered_docs = central_docs if selected_cat == "Todas las Categorías" else [d for d in central_docs if d["category"] == selected_cat]
            
            st.markdown(f"**Total documentos disponibles:** {len(filtered_docs)}")
            
            for d in filtered_docs:
                with st.container():
                    st.markdown(f"""
                    <div style="background:white; border:1px solid #E2E8F0; border-left:4px solid #0F766E; border-radius:8px; padding:14px; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-size:15px; font-weight:700; color:#1E293B;">📄 {d['original_name']}</span>
                                <span style="margin-left:10px; background:#F1F5F9; color:#475569; padding:2px 8px; border-radius:12px; font-size:12px;">{d['category']}</span>
                            </div>
                            <div style="font-size:12px; color:#64748B;">
                                📅 Subido: {d['uploaded_at']} • 💾 {d['size_kb']} KB
                            </div>
                        </div>
                        <div style="margin-top:6px; font-size:13px; color:#475569;">
                            <b>Nota / Versión:</b> {d['notes'] if d['notes'] else 'Sin observaciones adicionales'}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    c_b1, c_b2, c_b3 = st.columns([1, 1, 4])
                    with c_b1:
                        try:
                            with open(d["filepath"], "rb") as f_d:
                                st.download_button(
                                    label="⬇️ Descargar / Abrir",
                                    data=f_d.read(),
                                    file_name=d["original_name"],
                                    key=f"dl_cent_{d['filename']}",
                                    use_container_width=True
                                )
                        except Exception:
                            st.warning("Archivo no disponible")
                    with c_b2:
                        if st.button("🗑️ Eliminar", key=f"del_cent_{d['filename']}", use_container_width=True):
                            storage.delete_central_document(d["filename"])
                            st.rerun()
        else:
            st.info("Aún no se han cargado documentos en el Repositorio Central. Utiliza la pestaña '📤 Cargar Nuevo Documento Maestro' para subir el manual consolidado, instructivos de New Health o guías de práctica clínica.")

# ====================================================
# PESTAÑA 5: MANUAL Y REFERENCIAS
# ====================================================
elif menu == "📚 Manual y Referencias":
    st.markdown("### 📚 Biblioteca de Referencias Técnicas del Programa NewCare")
    st.markdown("Acceso rápido a las guías de práctica clínica internacionales adoptadas, escalas validadas y el glosario estándar exigido por New Health.")
    
    t_guias, t_escalas, t_glosario = st.tabs(["🩺 Guías de Práctica Clínica", "📏 Escalas Validadas", "📖 Glosario NewCare"])
    
    with t_guias:
        st.markdown("#### Guías Clínicas Adoptadas en Optimus Health (Archivos en Carpeta 5.4)")
        col_g1, col_g2 = st.columns(2)
        with col_g1:
            st.markdown("""
            - **❤️ Insuficiencia Cardíaca (IC):** *2022 AHA/ACC/HFSA Clinical Practice Guideline for the Management of Heart Failure*.
              * Manejo farmacológico de 4 pilares (ARNI, Betabloqueador, ARM, iSGLT2).
              * Detección precoz de congestión y telemonitoreo de peso diario.
            - **🫁 Enfermedad Pulmonar Obstructiva Crónica (EPOC):** *Guías GOLD 2023 Pocket Guide*.
              * Clasificación ABE, terapia inhalada triple (LABA/LAMA/CI) y plan de rescate en exacerbaciones.
            """)
        with col_g2:
            st.markdown("""
            - **Kidney Enfermedad Renal Crónica (ERC):** *KDIGO 2023 Clinical Practice Guideline for Diabetes Management in CKD*.
              * Control de albuminuria, tasa de filtración glomerular, nefroprotección y ajuste de fármacos.
            - **Liver Cirrosis Hepática:** *Clinical Guidelines for Acute-on-Chronic Liver Failure*.
              * Prevención de encefalopatía, paracentesis evacuadora, manejo de ascitis y detección de infecciones.
            """)

    with t_escalas:
        st.markdown("#### Escalas Clínicas Parametrizadas en INFORMEX iSSGS")
        st.markdown("""
        1. **Criterios NECPAL (New Health):** Identificación temprana de pacientes con necesidades de atención paliativa y pronóstico limitado.
        2. **Índice de Barthel:** Evaluación de dependencia para las 10 actividades básicas de la vida diaria (ABVD).
        3. **Índice de Comorbilidad de Charlson:** Pronóstico de supervivencia según carga de patologías crónicas coexistentes.
        4. **Escala de Zarit:** Cuantificación del grado de sobrecarga del cuidador principal (sin sobrecarga, leve, intensa).
        5. **Cuestionario de Pfeiffer:** Tamizaje de deterioro cognitivo en pacientes crónicos.
        6. **Escala de Braden:** Valoración del riesgo de úlceras por presión en pacientes en cama/domicilio.
        """)

    with t_glosario:
        st.markdown("#### Glosario Oficial de Términos Metodología NewCare")
        st.markdown("""
        - **IOCC:** Insuficiencias Orgánicas Crónicas Complejas (Cardíaca, Respiratoria, Renal y Hepática avanzadas).
        - **VMD:** Valoración Multidimensional inicial realizada para verificar pertinencia y complejidad.
        - **VI:** Valoración Integral exhaustiva que cubre esferas clínica, farmacológica, emocional, social y preferencias.
        - **PAI:** Plan de Atención Individualizado pactado y consensuado con el paciente y su familia.
        - **Cuidador Principal:** Persona de la red familiar que asume la responsabilidad diaria y directa del cuidado no profesional.
        - **Claudicación Familiar:** Pérdida de la capacidad de la familia para dar respuesta adecuada a las necesidades del paciente.
        - **Comunidades Compasivas:** Redes ciudadanas y de voluntariado capacitadas para cuidar y acompañar a personas con enfermedad avanzada.
        - **Modelo Pizarra:** Herramienta visual centralizada que consolida el estado, ubicación y alertas de la cohorte activa de pacientes.
        """)

# ====================================================
# PESTAÑA 6: EXPORTAR Y REPORTES
# ====================================================
elif menu == "📥 Exportar y Reportes":
    st.markdown("### 📥 Centro de Exportación y Descarga de Informes Oficiales")
    st.markdown("Descarga los resultados del Análisis GAP y el Plan de Mejora en múltiples formatos para auditoría, comités directivos y análisis de datos.")
    
    now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    
    # Grid de 6 formatos de exportación
    row1_c1, row1_c2 = st.columns(2)
    
    # 1. EXCEL OFICIAL (.xlsx)
    with row1_c1:
        st.markdown('''
        <div style="background:white; border:1px solid #CBD5E1; border-top:4px solid #0F766E; border-radius:10px; padding:18px; margin-bottom:16px;">
            <div style="font-size:17px; font-weight:700; color:#0F766E; margin-bottom:6px;">📊 Libro de Trabajo en Excel (.xlsx)</div>
            <div style="font-size:13px; color:#475569; margin-bottom:12px; line-height:1.4;">
                Libro de trabajo completo con 3 hojas estructuradas:<br>
                • <strong>Resumen Ejecutivo:</strong> Tarjetas KPI, veredicto y matriz semaforizada de los 13 capítulos.<br>
                • <strong>Matriz Detallada GAP:</strong> Los 64 requisitos con evidencias, criterios de New Health y hallazgos.<br>
                • <strong>Plan de Mejora Continua:</strong> Tareas correctivas de requisitos con brecha.
            </div>
        </div>
        ''', unsafe_allow_html=True)
        excel_bytes = generate_excel_report(eval_res, st.session_state.assessment_items)
        st.download_button(
            label="📥 Descargar Análisis GAP en Excel (.xlsx)",
            data=excel_bytes,
            file_name=f"Analisis_GAP_NEWCARE_Optimus_Health_{now_str}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            use_container_width=True
        )

    # 2. DOCUMENTO WORD FORMAL (.docx)
    with row1_c2:
        st.markdown('''
        <div style="background:white; border:1px solid #CBD5E1; border-top:4px solid #2563EB; border-radius:10px; padding:18px; margin-bottom:16px;">
            <div style="font-size:17px; font-weight:700; color:#2563EB; margin-bottom:6px;">📄 Informe Oficial en Word (.docx)</div>
            <div style="font-size:13px; color:#475569; margin-bottom:12px; line-height:1.4;">
                Documento formal listo para editar, imprimir y presentar a la Junta Directiva y a los auditores:<br>
                • Encabezado institucional de Optimus Health IPS.<br>
                • Diagnóstico global con tablas ejecutivas de cumplimiento.<br>
                • Fichas completas de cada plan de acción con texto 100% visible.<br>
                • Espacio formal para firmas de Líder NewCare, Calidad y Gerencia.
            </div>
        </div>
        ''', unsafe_allow_html=True)
        docx_bytes = export_reports.generate_docx_report(eval_res, st.session_state.assessment_items)
        st.download_button(
            label="📥 Descargar Informe Oficial en Word (.docx)",
            data=docx_bytes,
            file_name=f"Informe_Oficial_GAP_NEWCARE_Optimus_{now_str}.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            use_container_width=True
        )

    st.markdown("<br>", unsafe_allow_html=True)
    row2_c1, row2_c2 = st.columns(2)

    # 3. CSV DEL PLAN DE MEJORA CONTINUA (.csv)
    with row2_c1:
        st.markdown('''
        <div style="background:white; border:1px solid #CBD5E1; border-top:4px solid #F59E0B; border-radius:10px; padding:18px; margin-bottom:16px;">
            <div style="font-size:17px; font-weight:700; color:#B45309; margin-bottom:6px;">🎯 Plan de Mejora Continua en CSV (.csv)</div>
            <div style="font-size:13px; color:#475569; margin-bottom:12px; line-height:1.4;">
                Archivo plano con codificación <strong>UTF-8-BOM</strong> (abre perfecto en Excel sin errores de tildes):<br>
                • Contiene exclusivamente las acciones correctivas de las brechas detectadas.<br>
                • Ideal para importar a Power BI, gestores de tareas o seguimiento operativo.
            </div>
        </div>
        ''', unsafe_allow_html=True)
        csv_action_bytes = export_reports.generate_csv_action_plan(st.session_state.assessment_items)
        st.download_button(
            label="📥 Descargar Plan de Mejora (.csv)",
            data=csv_action_bytes,
            file_name=f"Plan_Mejora_NEWCARE_Optimus_{now_str}.csv",
            mime="text/csv",
            use_container_width=True
        )

    # 4. CSV DE LA MATRIZ MAESTRA COMPLETA (.csv)
    with row2_c2:
        st.markdown('''
        <div style="background:white; border:1px solid #CBD5E1; border-top:4px solid #10B981; border-radius:10px; padding:18px; margin-bottom:16px;">
            <div style="font-size:17px; font-weight:700; color:#065F46; margin-bottom:6px;">📑 Matriz Maestra Completa en CSV (.csv)</div>
            <div style="font-size:13px; color:#475569; margin-bottom:12px; line-height:1.4;">
                Base de datos completa con los 64 requisitos normativos evaluados:<br>
                • Códigos, títulos, criterios de New Health, puntuación y evidencias.<br>
                • Delimitado por punto y coma con codificación UTF-8-BOM.
            </div>
        </div>
        ''', unsafe_allow_html=True)
        csv_matrix_bytes = export_reports.generate_csv_matrix(st.session_state.assessment_items)
        st.download_button(
            label="📥 Descargar Matriz Maestra (.csv)",
            data=csv_matrix_bytes,
            file_name=f"Matriz_Completa_NEWCARE_Optimus_{now_str}.csv",
            mime="text/csv",
            use_container_width=True
        )

    st.markdown("<br>", unsafe_allow_html=True)
    row3_c1, row3_c2 = st.columns(2)

    # 5. COPIA DE SEGURIDAD JSON (.json)
    with row3_c1:
        st.markdown('''
        <div style="background:white; border:1px solid #CBD5E1; border-top:4px solid #6366F1; border-radius:10px; padding:18px; margin-bottom:16px;">
            <div style="font-size:17px; font-weight:700; color:#4338CA; margin-bottom:6px;">💾 Copia de Seguridad Estructurada (.json)</div>
            <div style="font-size:13px; color:#475569; margin-bottom:12px; line-height:1.4;">
                Respaldo completo de la evaluación diagnóstica en formato JSON estándar:<br>
                • Permite archivar instantáneas de auditoría o transferir datos a otros sistemas.
            </div>
        </div>
        ''', unsafe_allow_html=True)
        json_bytes = export_reports.generate_json_export(eval_res, st.session_state.assessment_items)
        st.download_button(
            label="📥 Descargar Respaldo de Datos (.json)",
            data=json_bytes,
            file_name=f"Backup_GAP_NEWCARE_Optimus_{now_str}.json",
            mime="application/json",
            use_container_width=True
        )

    # 6. INFORME IMPRIMIBLE HTML / PDF
    with row3_c2:
        st.markdown('''
        <div style="background:white; border:1px solid #CBD5E1; border-top:4px solid #64748B; border-radius:10px; padding:18px; margin-bottom:16px;">
            <div style="font-size:17px; font-weight:700; color:#334155; margin-bottom:6px;">🖨️ Informe Ejecutivo Imprimible (HTML / PDF)</div>
            <div style="font-size:13px; color:#475569; margin-bottom:12px; line-height:1.4;">
                Vista de impresión formal en HTML optimizada para navegador:<br>
                • Puedes abrirlo y presionar <strong>Ctrl + P</strong> para guardarlo directamente en PDF.
            </div>
        </div>
        ''', unsafe_allow_html=True)
        
        table_rows_html = ""
        for g in eval_res["groups"]:
            table_rows_html += f'''
            <tr>
                <td style="text-align:center;">{g['code']}</td>
                <td>{g['name']}</td>
                <td style="text-align:right;">{g['weight_differential']}%</td>
                <td style="text-align:center;">{g['total_items']}</td>
                <td style="text-align:right;">{g['points_obtained']:.1f} / {int(g['max_points'])}</td>
                <td style="text-align:right; font-weight:bold;">{g['compliance_pct']}%</td>
                <td style="text-align:right;">{g['gap_pct']}%</td>
                <td style="text-align:center;">{g['status_label']}</td>
            </tr>
            '''
            
        report_html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Informe GAP Analysis NewCare - Optimus Health IPS</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1E293B; }}
        .header {{ border-bottom: 2px solid #0F766E; padding-bottom: 15px; margin-bottom: 25px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #0F766E; }}
        .subtitle {{ font-size: 14px; color: #64748B; margin-top: 5px; }}
        .kpi-table {{ width: 100%; margin-bottom: 25px; border-collapse: collapse; }}
        .kpi-table td {{ padding: 12px; border: 1px solid #CBD5E1; text-align: center; }}
        .kpi-val {{ font-size: 20px; font-weight: bold; }}
        table.data {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }}
        table.data th {{ background: #334155; color: white; padding: 8px; border: 1px solid #CBD5E1; }}
        table.data td {{ padding: 6px 8px; border: 1px solid #CBD5E1; }}
        .signature-box {{ margin-top: 50px; display: flex; justify-content: space-between; }}
        .sig-line {{ border-top: 1px solid #334155; width: 250px; text-align: center; padding-top: 6px; font-size: 13px; }}
    </style>
</head>
<body>
    <div class="header">
        <div class="title">OPTIMUS HEALTH IPS - INFORME OFICIAL DE ANÁLISIS GAP NEWCARE</div>
        <div class="subtitle">Evaluación Diagnóstica frente al Estándar de la Fundación New Health • Fecha: {datetime.date.today().strftime('%d/%m/%Y')}</div>
    </div>
    <table class="kpi-table">
        <tr>
            <td><strong>Cumplimiento Global:</strong><br><span class="kpi-val" style="color:#0F766E;">{eval_res['global_compliance']}%</span></td>
            <td><strong>Brecha Total (GAP):</strong><br><span class="kpi-val" style="color:#DC2626;">{eval_res['global_gap']}%</span></td>
            <td><strong>Meta de Certificación:</strong><br><span class="kpi-val">{eval_res['target_pct']}%</span></td>
            <td><strong>Veredicto:</strong><br><span class="kpi-val" style="font-size:14px; color:#0F766E;">{eval_res['verdict_title']}</span></td>
        </tr>
    </table>
    <h3>Resumen por Grupos Normativos</h3>
    <table class="data">
        <thead>
            <tr><th>Cód</th><th>Capítulo Normativo NewCare</th><th>Peso %</th><th>Req.</th><th>Puntos</th><th>% Cumplimiento</th><th>Brecha %</th><th>Estado</th></tr>
        </thead>
        <tbody>
            {table_rows_html}
        </tbody>
    </table>
    <div class="signature-box" style="margin-top:60px; display:flex; justify-content:space-around;">
        <div style="display:inline-block; margin-right:50px;"><div class="sig-line">Líder Programa NEWCARE<br>Optimus Health IPS</div></div>
        <div style="display:inline-block; margin-right:50px;"><div class="sig-line">Coordinador de Calidad<br>Optimus Health IPS</div></div>
        <div style="display:inline-block;"><div class="sig-line">Dirección General<br>Optimus Health IPS</div></div>
    </div>
</body>
</html>
'''
        st.download_button(
            label="📄 Descargar Informe Ejecutivo en HTML (Imprimible)",
            data=report_html.encode("utf-8"),
            file_name=f"Informe_Ejecutivo_GAP_NEWCARE_{now_str}.html",
            mime="text/html",
            use_container_width=True
        )
