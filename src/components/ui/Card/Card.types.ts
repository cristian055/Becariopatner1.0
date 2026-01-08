export type CardVariant = 'default' | 'outlined' | 'flat';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  elevation?: CardElevation;
  padding?: CardPadding;
  hover?: boolean;
  className?: string;
}
