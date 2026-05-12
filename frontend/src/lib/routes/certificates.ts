export const EKAHUA_ECSE_CERTIFICATE_PATH =
  "/2019-ECSE-Certificate-ekahau-Vladimir_Kolchurin.pdf";

export function setupCertificatePreloadOnIntersect(
  section: HTMLElement | null | undefined,
  documentRef: Document,
  rootMargin = "200px",
): () => void {
  if (!section) {
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) {
        return;
      }

      const link = documentRef.createElement("link");
      link.rel = "preload";
      link.as = "fetch";
      link.href = EKAHUA_ECSE_CERTIFICATE_PATH;
      documentRef.head.appendChild(link);
      observer.disconnect();
    },
    { rootMargin },
  );

  observer.observe(section);

  return () => observer.disconnect();
}
