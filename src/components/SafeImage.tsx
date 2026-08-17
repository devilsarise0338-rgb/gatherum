import React from 'react';

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackEmoji?: string;
}

export default function SafeImage({ src, alt, className, style, fallbackEmoji = '🎉' }: Props) {
  const [errored, setErrored] = React.useState(false);

  if (!src || errored) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--cream)',
          color: 'var(--ink-muted)',
          fontSize: '2.5rem',
          ...style,
        }}
        aria-label={alt}
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  );
}
