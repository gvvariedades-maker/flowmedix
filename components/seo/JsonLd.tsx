type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdObject = {
  [key: string]: JsonLdPrimitive | JsonLdObject | JsonLdObject[];
};

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

export function JsonLd({ data }: JsonLdProps) {
  const graph = Array.isArray(data) ? data : [data];
  const payload = graph.length === 1 ? graph[0] : { '@context': 'https://schema.org', '@graph': graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, '\\u003c'),
      }}
    />
  );
}
