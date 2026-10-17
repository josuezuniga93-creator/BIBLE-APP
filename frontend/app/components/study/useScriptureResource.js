"use client";

import { useEffect, useState } from "react";
import { fetchChapter } from "../../lib/api";

export function useScriptureResource(url) {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(url.split("?")[1]);
    setState({ loading: true, data: null, error: null });
    fetchChapter(
      Number(query.get("book")),
      Number(query.get("chapter")),
      query.get("translation") || "kjv",
    )
      .then((data) => {
        if (active) setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (active)
          setState({
            loading: false,
            data: null,
            error: error.message || "Unable to load this reading.",
          });
      });
    return () => {
      active = false;
    };
  }, [url, attempt]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
