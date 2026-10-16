#!/usr/bin/env python3
"""Generate AAP Starter Kit architecture draw.io diagrams and PNG exports."""

from __future__ import annotations

import html
import uuid
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent

# Red Hat architecture palette (aligned with ramendr-starter-kit diagrams)
TEAL = "#43ADAF"
GRAY = "#4C4C4C"
CLUSTER = "#4CB6D6"
FONT = "Red Hat Text"
TEXT = "#595959"
WHITE = "#FFFFFF"
BORDER = "#CDCECE"


@dataclass
class Card:
    title: str
    body: str
    x: float
    y: float
    w: float = 200
    h: float = 110
    header: str = TEAL


@dataclass
class Diagram:
    slug: str
    name: str
    title: str
    cards: list[Card]
    cluster_h: float
    page_w: int = 1400
    page_h: int = 900


def esc(s: str) -> str:
    return html.escape(s, quote=True).replace("\n", "&#xa;")


def cell(
    cid: str,
    value: str,
    style: str,
    x: float,
    y: float,
    w: float,
    h: float,
    parent: str = "1",
) -> str:
    return (
        f'        <mxCell id="{cid}" value="{esc(value)}" style="{style}" '
        f'vertex="1" parent="{parent}">\n'
        f'          <mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry" />\n'
        f"        </mxCell>\n"
    )


def edge(
    eid: str,
    style: str,
    sx: float,
    sy: float,
    tx: float,
    ty: float,
    parent: str = "1",
    source: str | None = None,
    target: str | None = None,
) -> str:
    src = f' source="{source}"' if source else ""
    tgt = f' target="{target}"' if target else ""
    return (
        f'        <mxCell id="{eid}" value="" style="{style}" edge="1" '
        f'parent="{parent}"{src}{tgt}>\n'
        f'          <mxGeometry relative="1" as="geometry">\n'
        f'            <mxPoint x="{sx}" y="{sy}" as="sourcePoint" />\n'
        f'            <mxPoint x="{tx}" y="{ty}" as="targetPoint" />\n'
        f"          </mxGeometry>\n"
        f"        </mxCell>\n"
    )


def drawio_card(prefix: str, card: Card) -> str:
    parts = []
    parts.append(
        cell(
            f"{prefix}-bg",
            "",
            f"rounded=1;whiteSpace=wrap;html=1;fillColor={WHITE};strokeColor={BORDER};"
            f"strokeWidth=1;shadow=0;",
            card.x,
            card.y,
            card.w,
            card.h,
        )
    )
    parts.append(
        cell(
            f"{prefix}-hdr",
            f"<b>{card.title}</b>",
            f"rounded=0;whiteSpace=wrap;html=1;fillColor={card.header};strokeColor={card.header};"
            f"fontColor={WHITE};fontFamily={FONT};fontSize=12;align=left;"
            f"spacingLeft=10;verticalAlign=middle;",
            card.x + 8,
            card.y + 8,
            card.w - 16,
            28,
        )
    )
    parts.append(
        cell(
            f"{prefix}-body",
            card.body,
            f"text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;"
            f"whiteSpace=wrap;rounded=0;fontFamily={FONT};fontSize=11;fontColor={TEXT};"
            f"spacingLeft=4;",
            card.x + 12,
            card.y + 42,
            card.w - 24,
            card.h - 52,
        )
    )
    return "".join(parts)


def build_drawio(diagram: Diagram) -> str:
    diagram_id = uuid.uuid4().hex[:20]
    parts: list[str] = []

    parts.append(
        cell(
            "title",
            f"<b>{diagram.title}</b>",
            f"text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;"
            f"fontFamily={FONT};fontSize=26;fontColor={TEXT};",
            40,
            20,
            1200,
            40,
        )
    )

    cluster_x, cluster_y, cluster_w = 280, 90, 1040
    parts.append(
        cell(
            "cluster",
            "",
            f"rounded=1;whiteSpace=wrap;html=1;fillColor={CLUSTER};strokeColor=#000000;"
            f"strokeWidth=1;opacity=20;",
            cluster_x,
            cluster_y,
            cluster_w,
            diagram.cluster_h,
        )
    )
    parts.append(
        cell(
            "cluster-label",
            "<b>OpenShift cluster (hub)</b>",
            f"text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;"
            f"fontFamily={FONT};fontSize=16;fontColor={TEXT};",
            cluster_x + 16,
            cluster_y + 10,
            400,
            28,
        )
    )

    scm = Card(
        "SCM repository",
        "GitHub\nHelm charts\nCaC (aap-config)",
        40,
        200,
        200,
        120,
        GRAY,
    )
    parts.append(drawio_card("scm", scm))

    parts.append(
        cell(
            "user",
            "User / Admin",
            f"shape=ellipse;whiteSpace=wrap;html=1;fillColor={WHITE};strokeColor={GRAY};"
            f"fontFamily={FONT};fontSize=12;fontColor={TEXT};",
            70,
            360,
            140,
            70,
        )
    )
    parts.append(
        edge(
            "e-user-scm",
            f"endArrow=classic;html=1;rounded=0;strokeColor={GRAY};strokeWidth=2;",
            140,
            360,
            140,
            320,
        )
    )
    parts.append(
        edge(
            "e-scm-cluster",
            f"endArrow=classic;html=1;rounded=0;strokeColor={TEAL};strokeWidth=2;",
            240,
            260,
            280,
            200,
            source="scm-bg",
            target="cluster",
        )
    )
    parts.append(
        cell(
            "e-scm-label",
            "GitOps sync",
            f"text;html=1;strokeColor=none;fillColor=none;align=center;"
            f"fontFamily={FONT};fontSize=11;fontColor={TEAL};fontStyle=2;",
            220,
            165,
            90,
            20,
        )
    )

    for i, card in enumerate(diagram.cards):
        parts.append(drawio_card(f"c{i}", card))

    body = "".join(parts)
    return f"""<mxfile host="app.diagrams.net" agent="aap-starter-kit-docs" version="22.1.0">
  <diagram name="{esc(diagram.name)}" id="{diagram_id}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{diagram.page_w}" pageHeight="{diagram.page_h}" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
{body}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
"""


def _font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                "/usr/share/fonts/redhat/RedHatText-Bold.ttf",
                "/usr/share/fonts/redhat/RedHatTextVF.ttf",
                "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
                "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
            ]
        )
    else:
        candidates.extend(
            [
                "/usr/share/fonts/redhat/RedHatText-Regular.ttf",
                "/usr/share/fonts/redhat/RedHatTextVF.ttf",
                "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
                "/usr/share/fonts/dejavu/DejaVuSans.ttf",
            ]
        )
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def _hex(color: str) -> tuple[int, int, int]:
    c = color.lstrip("#")
    return tuple(int(c[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def _rounded_rect(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    radius: int,
    fill=None,
    outline=None,
    width: int = 1,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def _draw_card(draw: ImageDraw.ImageDraw, card: Card, scale: int) -> None:
    x, y, w, h = (int(v * scale) for v in (card.x, card.y, card.w, card.h))
    _rounded_rect(
        draw,
        (x, y, x + w, y + h),
        radius=8 * scale,
        fill=_hex(WHITE),
        outline=_hex(BORDER),
        width=max(1, scale),
    )
    hdr_x, hdr_y = x + 8 * scale, y + 8 * scale
    hdr_w, hdr_h = w - 16 * scale, 28 * scale
    _rounded_rect(
        draw,
        (hdr_x, hdr_y, hdr_x + hdr_w, hdr_y + hdr_h),
        radius=4 * scale,
        fill=_hex(card.header),
        outline=_hex(card.header),
    )
    draw.text(
        (hdr_x + 10 * scale, hdr_y + 6 * scale),
        card.title,
        fill=_hex(WHITE),
        font=_font(12 * scale, bold=True),
    )
    body_y = y + 42 * scale
    for i, line in enumerate(card.body.split("\n")):
        draw.text(
            (x + 12 * scale, body_y + i * 16 * scale),
            line,
            fill=_hex(TEXT),
            font=_font(11 * scale),
        )


def build_png(diagram: Diagram, scale: int = 2) -> Image.Image:
    width = diagram.page_w * scale
    height = diagram.page_h * scale
    img = Image.new("RGB", (width, height), _hex(WHITE))
    draw = ImageDraw.Draw(img, "RGBA")

    draw.text(
        (40 * scale, 24 * scale),
        diagram.title,
        fill=_hex(TEXT),
        font=_font(24 * scale, bold=True),
    )

    cluster_x, cluster_y, cluster_w = 280, 90, 1040
    cx, cy, cw, ch = (
        int(cluster_x * scale),
        int(cluster_y * scale),
        int(cluster_w * scale),
        int(diagram.cluster_h * scale),
    )
    # Semi-transparent cluster tint
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    cluster_rgb = _hex(CLUSTER)
    od.rounded_rectangle(
        (cx, cy, cx + cw, cy + ch),
        radius=12 * scale,
        fill=(*cluster_rgb, 50),
        outline=(0, 0, 0, 180),
        width=max(1, scale),
    )
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    draw.text(
        (cx + 16 * scale, cy + 12 * scale),
        "OpenShift cluster (hub)",
        fill=_hex(TEXT),
        font=_font(16 * scale, bold=True),
    )

    scm = Card(
        "SCM repository",
        "GitHub\nHelm charts\nCaC (aap-config)",
        40,
        200,
        200,
        120,
        GRAY,
    )
    _draw_card(draw, scm, scale)

    # User oval
    ux, uy, uw, uh = 70 * scale, 360 * scale, 140 * scale, 70 * scale
    draw.ellipse(
        (ux, uy, ux + uw, uy + uh),
        fill=_hex(WHITE),
        outline=_hex(GRAY),
        width=max(1, scale),
    )
    draw.text(
        (ux + 28 * scale, uy + 24 * scale),
        "User / Admin",
        fill=_hex(TEXT),
        font=_font(12 * scale),
    )

    # Arrows: user -> scm, scm -> cluster
    draw.line(
        (140 * scale, 360 * scale, 140 * scale, 320 * scale),
        fill=_hex(GRAY),
        width=2 * scale,
    )
    draw.polygon(
        [
            (140 * scale, 320 * scale),
            (134 * scale, 332 * scale),
            (146 * scale, 332 * scale),
        ],
        fill=_hex(GRAY),
    )
    draw.line(
        (240 * scale, 260 * scale, 280 * scale, 200 * scale),
        fill=_hex(TEAL),
        width=2 * scale,
    )
    draw.polygon(
        [
            (280 * scale, 200 * scale),
            (268 * scale, 204 * scale),
            (274 * scale, 214 * scale),
        ],
        fill=_hex(TEAL),
    )
    draw.text(
        (210 * scale, 165 * scale),
        "GitOps sync",
        fill=_hex(TEAL),
        font=_font(11 * scale),
    )

    for card in diagram.cards:
        _draw_card(draw, card, scale)

    # Crop to known content extents (white background defeats getbbox).
    content_right = max(
        280 + 1040,
        max((c.x + c.w for c in diagram.cards), default=0),
        240,
    )
    content_bottom = max(
        90 + diagram.cluster_h,
        max((c.y + c.h for c in diagram.cards), default=0),
        430,
    )
    pad = 30 * scale
    img = img.crop(
        (
            0,
            0,
            min(img.width, int(content_right * scale) + pad),
            min(img.height, int(content_bottom * scale) + pad),
        )
    )
    return img


def variants() -> list[Diagram]:
    return [
        Diagram(
            slug="minimal-aap",
            name="minimal-aap",
            title="Schematic - AAP Starter Kit (minimal-aap variant)",
            cluster_h=400,
            cards=[
                Card(
                    "GitOps",
                    "Validated Patterns Operator\nOpenShift GitOps\n(single Argo CD)",
                    310,
                    140,
                    220,
                    120,
                    TEAL,
                ),
                Card(
                    "Secrets",
                    "HashiCorp Vault\nExternal Secrets Operator",
                    560,
                    140,
                    220,
                    120,
                    GRAY,
                ),
                Card(
                    "Ansible Automation Platform",
                    "Operator stable-2.7\nController instance\nHub: disabled\nLightspeed: disabled",
                    310,
                    290,
                    280,
                    140,
                    TEAL,
                ),
                Card(
                    "aap-config (CaC)",
                    "Config as Code\nDefault: agof_null_config",
                    620,
                    290,
                    240,
                    140,
                    GRAY,
                ),
            ],
        ),
        Diagram(
            slug="aap-with-hub",
            name="aap-with-hub",
            title="Schematic - AAP Starter Kit (aap-with-hub variant)",
            cluster_h=400,
            cards=[
                Card(
                    "GitOps",
                    "Validated Patterns Operator\nOpenShift GitOps\n(single Argo CD)",
                    310,
                    140,
                    220,
                    110,
                    TEAL,
                ),
                Card(
                    "Secrets",
                    "HashiCorp Vault\nExternal Secrets Operator",
                    560,
                    140,
                    220,
                    110,
                    GRAY,
                ),
                Card(
                    "OpenShift Data Foundation",
                    "odf-operator\nRWX storage for hub\nObject storage: disabled",
                    810,
                    140,
                    240,
                    110,
                    TEAL,
                ),
                Card(
                    "Ansible Automation Platform",
                    "Operator stable-2.7\nController + automation hub\nLightspeed: disabled",
                    310,
                    290,
                    300,
                    140,
                    TEAL,
                ),
                Card(
                    "aap-config (CaC)",
                    "Config as Code\nDefault: agof_null_config",
                    640,
                    290,
                    240,
                    140,
                    GRAY,
                ),
            ],
        ),
        Diagram(
            slug="aap-with-ao",
            name="aap-with-ao",
            title="Schematic - AAP Starter Kit (aap-with-ao variant)",
            cluster_h=540,
            page_h=1000,
            cards=[
                Card(
                    "GitOps",
                    "Validated Patterns Operator\nOpenShift GitOps\n(single Argo CD)",
                    310,
                    140,
                    220,
                    110,
                    TEAL,
                ),
                Card(
                    "Secrets",
                    "HashiCorp Vault\nExternal Secrets Operator\nAO Postgres secrets",
                    560,
                    140,
                    240,
                    110,
                    GRAY,
                ),
                Card(
                    "Ansible Automation Platform",
                    "Operator stable-2.7\nController only\nHub + Lightspeed: disabled",
                    310,
                    280,
                    280,
                    130,
                    TEAL,
                ),
                Card(
                    "aap-config (CaC)",
                    "Config as Code\nDefault: agof_null_config",
                    620,
                    280,
                    220,
                    130,
                    GRAY,
                ),
                Card(
                    "CloudNativePG",
                    "certified-operators\nPostgreSQL 15\norchestrator / temporal DBs\n(not RH-supported for AO)",
                    310,
                    440,
                    280,
                    140,
                    GRAY,
                ),
                Card(
                    "Automation Orchestrator",
                    "AO operator + instance\nUses CNPG databases",
                    620,
                    440,
                    260,
                    140,
                    TEAL,
                ),
            ],
        ),
        Diagram(
            slug="complete-aap-ao",
            name="complete-aap-ao",
            title="Schematic - AAP Starter Kit (complete-aap-ao variant)",
            cluster_h=530,
            page_h=1000,
            cards=[
                Card(
                    "GitOps",
                    "Validated Patterns Operator\nOpenShift GitOps\n(single Argo CD)",
                    310,
                    140,
                    210,
                    100,
                    TEAL,
                ),
                Card(
                    "Secrets",
                    "Vault + External Secrets\nAO Postgres secrets",
                    540,
                    140,
                    220,
                    100,
                    GRAY,
                ),
                Card(
                    "OpenShift Data Foundation",
                    "RWX storage for hub\nObject storage: disabled",
                    780,
                    140,
                    240,
                    100,
                    TEAL,
                ),
                Card(
                    "Ansible Automation Platform",
                    "Operator stable-2.7\nController + automation hub\nLightspeed: enabled",
                    310,
                    270,
                    300,
                    130,
                    TEAL,
                ),
                Card(
                    "aap-config (CaC)",
                    "Config as Code\nDefault: agof_null_config",
                    640,
                    270,
                    220,
                    130,
                    GRAY,
                ),
                Card(
                    "CloudNativePG",
                    "certified-operators\nPostgreSQL 15\norchestrator / temporal DBs\n(not RH-supported for AO)",
                    310,
                    430,
                    280,
                    140,
                    GRAY,
                ),
                Card(
                    "Automation Orchestrator",
                    "AO operator + instance\nUses CNPG databases",
                    620,
                    430,
                    260,
                    140,
                    TEAL,
                ),
            ],
        ),
    ]


def main() -> None:
    for diagram in variants():
        drawio_path = OUT / f"aap-architecture-{diagram.slug}.drawio"
        png_path = OUT / f"aap-architecture-{diagram.slug}.png"
        drawio_path.write_text(build_drawio(diagram), encoding="utf-8")
        build_png(diagram).save(png_path, format="PNG", optimize=True)
        print(f"Wrote {drawio_path.name} and {png_path.name}")


if __name__ == "__main__":
    main()
