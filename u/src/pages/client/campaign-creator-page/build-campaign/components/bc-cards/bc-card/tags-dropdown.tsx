import React from "react";
import chevron from "@/assets/icons/chevron-down.svg";

type Props = {
  items: string[];
  placeholder?: string;
};

export const TagsDropdown: React.FC<Props> = ({ items, placeholder = "—" }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const list = items?.filter(Boolean) ?? [];
  const preview = list.length ? list.slice(0, 1) : [];

  return (
    <div className={`tags-dd ${isMobile ? "tags-dd--mobile" : ""}`} ref={ref}>
      <button
        type="button"
        className="tags-dd__btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}>
        <div className="tags-dd__preview">
          {!isMobile && (
            <>
              {preview.length ? (
                preview.map((t, i) => (
                  <span className="tag" key={i} title={t}>
                    {t}
                  </span>
                ))
              ) : (
                <span className="tags-dd__placeholder">{placeholder}</span>
              )}

              {list.length > 1 && (
                <span className="tags-dd__more">+{list.length - 1}</span>
              )}
            </>
          )}
        </div>

        <img
          className={`tags-dd__chevron ${open ? "open" : ""}`}
          src={chevron}
          alt=""
        />
      </button>

      {open && (
        <div className="tags-dd__menu" role="listbox">
          {list.length ? (
            list.map((t, i) => (
              <div className="tags-dd__item" key={i} title={t}>
                {t}
              </div>
            ))
          ) : (
            <div className="tags-dd__empty">No data</div>
          )}
        </div>
      )}
    </div>
  );
};
