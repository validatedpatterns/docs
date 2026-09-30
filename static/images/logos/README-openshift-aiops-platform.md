# OpenShift AIOps Platform Logo

## Logo Source

The pattern logo (`openshift-aiops-platform.png`) is rendered from the official KubeHeal brand icon:
- **Source SVG**: [`assets/branding/svg/kubeheal-icon.svg`](https://github.com/KubeHeal/openshift-aiops-platform/blob/main/assets/branding/svg/kubeheal-icon.svg)
- **Brand guide**: [`assets/branding/README.md`](https://github.com/KubeHeal/openshift-aiops-platform/blob/main/assets/branding/README.md)

## Logo Details

- **Format**: PNG (400×400 px, RGBA)
- **Visual elements**: Cybernetic hexagonal node, ECG pulse wave, healing cross, neural mesh lattice
- **Colors**: Deep Space Navy background, Self-Healing Cyan pulse, OpenShift Crimson peak, Cobalt Intelligence nodes
- **Rendered with**: cairosvg from the master vector icon

## Regenerating

To re-render from the latest SVG source:

```bash
pip install cairosvg
python3 -c "
import cairosvg
cairosvg.svg2png(
    url='assets/branding/svg/kubeheal-icon.svg',
    write_to='static/images/logos/openshift-aiops-platform.png',
    output_width=400, output_height=400
)
"
```

## Contact

- Pattern maintainers: https://github.com/KubeHeal/openshift-aiops-platform
- Brand assets: https://github.com/KubeHeal/openshift-aiops-platform/tree/main/assets/branding
