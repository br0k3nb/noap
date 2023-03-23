import { useMemo, useState } from "react";
import { useSettings } from "./context/SettingsContext";
import Switch from "./ui/Switch";

export default function Settings() {
  const windowLocation = window.location;
  const {
    setOption,
    settings: { isRichText, isAutocomplete },
  } = useSettings();

  const [showSettings, setShowSettings] = useState(false);

  const [isSplitScreen, search] = useMemo(() => {
    const parentWindow = window.parent;
    const _search = windowLocation.search;
    const _isSplitScreen =
      parentWindow && parentWindow.location.pathname === "/split/";

    return [_isSplitScreen, _search];
  }, [windowLocation]);

  return (
    <>
      <button
        id="options-button"
        className={`editor-dev-button ${showSettings ? "active" : ""}`}
        onClick={() => setShowSettings(!showSettings)}
      />
      {showSettings ? (
        <div className="switches">
          <Switch
            onClick={() => {
              setOption("isRichText", !isRichText);
              setOption("isCollab", false);
            }}
            checked={isRichText}
            text="Rich Text"
          />
          <Switch
            onClick={() => setOption("isAutocomplete", !isAutocomplete)}
            checked={isAutocomplete}
            text="Autocomplete"
          />
        </div>
      ) : null}
    </>
  );
}
