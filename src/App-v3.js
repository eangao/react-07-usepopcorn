import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
//API KEY - www.omdbapi.com/
const KEY = "cd8436d0";
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  // const [watched, setWatched] = useState([]);
  //////////////
  //   So what we're going to do now is to,
  // instead of just passing in a value
  // is to pass in a callback function.
  // And so that's because the useState hook
  // also accepts a callback function instead
  // of just a single value.
  // And so we can then initialize the state
  // with whatever value this callback function will return.
  //   And this function here actually needs to be a pure function
  // and it cannot receive any arguments.
  // So passing arguments here is not going to work.
  // So just a very simple pure function that returns something
  // and that something will be used by React
  // as the initial state.
  // And also just like the values that we pass in,
  // React will only consider this function here
  // on the initial render.
  // So this function is only executed once on the initial render
  // and is simply ignored on subsequent re-renders.
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    //
    // return JSON.parse(storedValue);
    //check if have storedValue in localstorage
    return storedValue ? JSON.parse(storedValue) : [];
  });
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    //     Now here, we cannot simply use the watched array
    // like this because it has just been updated here.
    // And so as we already know
    // this updating happens in an asynchronous way.
    // And so therefore right here, this is still stale state.
    // So it's basically still the old version
    // before a new movie has been added.
    // And so we need to basically do the same thing as here.
    // So we need to build a new array based on the watched
    // so the current state plus the new movie.
    //     But as I was saying
    // we can also do it right inside in effect.
    // So instead of doing it here in the event handler function,
    // and we will actually do it in an effect
    // instead of here in this event handler function
    // because later in the section we will want to make
    // this storing data into local storage, reusable.
    // So let's just comment this out
    ////////
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function handleDeleteWatched(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      //       And now we don't have to create any new array
      // because this effect here will only run after the movies
      // have already been updated.
      // So after watched is already the new state.
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );
  useEffect(
    function () {
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
      handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        {/* Passing Elements as Props (Alternative to children) */}
        {/* <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          }
        /> */}
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  // ref in the first step
  const inputEl = useRef(null);
  // useEffect(function () {
  //   //     However, as we learned at the very beginning,
  //   // React is all about being declarative.
  //   // And so manually selecting a dom element like this
  //   // is not really the React way of doing things.
  //   // So it's not in line with the rest of our React code.
  //   // So, in React, we really don't want
  //   // to manually add event listeners, like this,
  //   // and also having to add classes or IDs
  //   // just for the purpose of selecting is not really nice.
  //   // And, again, not really the React way of doing things.
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   el.focus();
  // }, []);
  //   And so now in order to use this ref in the third step,
  // we can use again the useEffect hook.
  // So a new function that simply runs on mount.
  // So we need to use an effect in order to use a ref
  // that contains a DOM element like this one
  // because the ref only gets added to this DOM element here
  // after the DOM has already loaded.
  // And so therefore we can only access it in effect
  // which also runs after the DOM has been loaded.
  useEffect(
    function () {
      //DOM Element
      // console.log(inputEl.current);
      function callback(e) {
        if (e.code === "Enter") {
          //         There's just one final problem,
          // which is let's say that I'm writing this
          // and then I hit the Enter key again
          // and so this will then delete the text that we have.
          // So basically we don't want all of this here to happen
          // when the element is already focused,
          // so when it's already active.
          // But luckily for us
          // we can easily check which element is currently active
          // thanks to the document.activeElement property.
          // And so thanks to that we can say
          // if document.activeElement
          // which again is the element that is currently being focused.
          // So if that is equal to our input element,
          // so inputEl.current then just return.
          if (document.activeElement === inputEl.current) return;
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
      //clean up
      return () => document.addEventListener("keydown", callback);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl} // ref in the second step
    />
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
        </>
      )}
    </div>
  );
}
*/
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  // So let's just recap what we did here
  // and why this works.
  // So we created this ref here where we want
  // to store the amount of clicks that happened on the rating
  // before the movie is added,
  // but we don't want to render that information
  // onto the user interface.
  // Or in other words, we do not want to create a re-render.
  // And so that's why a ref is perfect for this.
  // So then each time the user rating was updated,
  // the component was re-rendered.
  // And so then after that re-render, this effect was executed
  // which means that after the rating had been updated,
  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  /*****************************/
  // this will violate the hooks rules
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true);
  /**************************** */
  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);
  // useEffect(
  //   function () {
  //     setIsTop(imdbRating > 8);
  //   },
  //   [imdbRating]
  // );
  /******************************** */
  //   And so this is the power
  // and one of the great advantages of derived state,
  // which is that it updates
  // basically as the component gets re-rendered.
  // And this is really as simple as it can get, right?
  // So this is pretty important to understand
  // so that the initial state value here
  // is only been looked at by React in the very beginning.
  // So only on component mount.
  // So never forget that.
  ////////////
  // const isTop = imdbRating > 8;
  // console.log(isTop);
  //   to give you yet another example
  // or another proof that updating state really is asynchronous
  // and that we need to use a colic function to update state
  // in certain situations.
  // So let's say that when we add a new movie
  // to our watch list right here
  // we want it to display the average of the rating that we gave
  // and the rating that is coming from IMDB.
  // So we want that to be displayed right here
  // const [avgRating, setAvgRating] = useState(0);
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
    // setAvgRating(Number(imdbRating));
    //     So it's asynchronous state setting,
    // which means that at this point here
    // the avgRating has not been set yet.
    // So it's still at zero,
    // which is the initial value right here.
    // And so because of that,
    // we say that the avgRating state is stale at this point.
    ////////
    //setAvgRating((avgRating + userRating) / 2);
    //////////////////////////
    //     But luckily for us, we already know how to solve this,
    // which is by passing in a callback function.
    // And so that callback will get access to the current value.
    /////////
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);
  }
  //   so we are really doing basically now some DOM manipulation.
  // And so we are stepping really outside of React here,
  // which is the reason why the React team
  // also calls the useEffect hook here an escape hatch.
  // So basically a way of escaping
  // having to write all the code using the React way.
  useEffect(
    function () {
      function callback(e) {
        //       when I hit the Escape key.
        // And indeed, the movie here was closed
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", callback);
      //clean up effect
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      // console.log(`Clean up effect for movie ${title}`);
      //clean up effect
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          {/* <p>{avgRating}</p> */}
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={(e) => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
