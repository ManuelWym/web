interface CampusFeaturePageProps {
  title: string;
  description: string;
}

export function CampusFeaturePage({
  title,
  description,
}: CampusFeaturePageProps) {
  return (
    <section className="campus-feature-page">
      <div className="campus-feature-eyebrow">CAMPUS VIRTUAL</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
