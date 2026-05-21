const AdminStatCard = ({
  icon: Icon,
  title,
  value,
  color = "purple",
}) => {
  return (
    <article className={`usuarios-stat-card ${color}`}>
      <Icon />

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
};

export default AdminStatCard;