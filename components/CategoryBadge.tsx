import { CATEGORY_MAP } from '@/data/categories';

interface Props {
  categoryId: string;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ categoryId, size = 'md' }: Props) {
  const cat = CATEGORY_MAP[categoryId];
  if (!cat) return null;

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'}`}
      style={{ backgroundColor: cat.color, color: cat.darkColor }}
    >
      {cat.label}
    </span>
  );
}
