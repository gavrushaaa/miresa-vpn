import CrowdCanvas from '../ui/CrowdCanvas';
import './aisa-crowd-section.css';

export default function AisaCrowdSection() {
  return <section className="aisa-crowd" aria-labelledby="aisa-crowd-title">
    <div className="aisa-crowd__copy">
      <h2 id="aisa-crowd-title">Один мир. Больше возможностей.</h2>
      <p>Твоё пространство в интернете.</p>
    </div>
    <div className="aisa-crowd__scene">
      <CrowdCanvas src={`${import.meta.env.BASE_URL}assets/openpeeps-sprites.png`} rows={7} cols={15} />
    </div>
  </section>;
}
