// And so that's kind of a strategy that I like to use,
// so using default exports for components like this one here
// and using named exports for custom hooks.
// Now, that's not really mandatory,
// but that's just the way I like to do it.

import { useEffect, useState } from "react";

//API KEY - www.omdbapi.com/
const KEY = "cd8436d0";

// And so now, remember that this really is a function.
// This is not a component.
// And so here, we don't accept props,
// but really we accept arguments like this.
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      //       And so now this function will only be called
      // if it actually exists.
      // So without this optional chaining part here,
      // we would first have to check if it does exist,
      // callback?.();

      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies.");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      // handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}
