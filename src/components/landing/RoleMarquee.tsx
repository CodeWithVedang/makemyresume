const ROLES = [
  "Freshers & campus placements",
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "UI/UX Designer",
  "Chartered Accountant",
  "Digital Marketing",
  "Sales & Business Development",
  "HR Executive",
  "Mechanical Engineer",
  "MBA graduates",
  "Teachers & educators",
  "Customer Support",
  "Internships",
];

/** Decorative ticker of roles the product is built for. */
export function RoleMarquee() {
  const items = [...ROLES, ...ROLES];
  return (
    <div className="marquee overflow-hidden py-2" aria-label="Built for every role">
      <ul className="marquee-track gap-3">
        {items.map((role, i) => (
          <li
            key={i}
            aria-hidden={i >= ROLES.length}
            className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm whitespace-nowrap text-muted-foreground"
          >
            {role}
          </li>
        ))}
      </ul>
    </div>
  );
}
