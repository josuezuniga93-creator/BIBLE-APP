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
    const load = async () => {
      let lastError;
      for (let retry = 0; retry < 3; retry++) {
        try {
          return await fetchChapter(
            Number(query.get("book")),
            Number(query.get("chapter")),
            query.get("translation") || "kjv",
          );
        } catch (error) {
          lastError = error;
          if (retry < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (retry + 1)));
        }
      }
      throw lastError;
    };
    load()
      .then((data) => {
        if (active) setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (active) {
          const technical = /429|bolls|helloao|proxy|fetch|network|abort/i.test(error?.message || "");
          setState({
            loading: false,
            data: null,
            error: technical
              ? "This Bible translation is taking longer than expected. Please try again."
              : error.message || "Unable to load this reading.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [url, attempt]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
