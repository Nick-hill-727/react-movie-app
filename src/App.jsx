import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://imdb.iamidiotareyoutoo.com';

const App = () => {

  // all states here
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null)
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  // debounces the search term to prevent making too many API requests by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearch(searchTerm), 1500, [searchTerm])

  // an array of popular searches on movie apps, just general keywords to generate a fleshed out homepage
  const popularSearches = [
    'Avengers', 'Batman', 'Spider-Man', 'Superman', 'Iron Man', 'Captain America',
    'Thor', 'Black Panther', 'Doctor Strange', 'Deadpool',
    'Harry Potter', 'Fantastic Beasts', 'Fast & Furious', 'Transformers', 'Mission Impossible',
    'James Bond', 'John Wick', 'Jurassic Park', 'Star Wars', 'The Matrix',
    'Frozen', 'Moana', 'Toy Story', 'Inside Out', 'Encanto', 'Zootopia', 'Coco',
    'Barbie', 'Oppenheimer', 'Dune', 'Wonka', 'Guardians of the Galaxy', 'The Marvels',
    'The Batman', 'Top Gun Maverick', 'Everything Everywhere All At Once', 'Chainsawman',
    'Demon slayer'
  ];

  // function to load trending movies for the trending section of our page
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.log(error)
    }
  }

  // Helper function to get random subset of search terms
  const getRandomTerms = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // function that gets the movies from the API, used by fetchmovies function
  const getMovies = async (terms) => {
    let allMovies = [];
    for (const term of terms) {
      try {

        const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(term)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch movies')
        }
        const data = await res.json();
        if (!data.description) {
          //setErrorMessage(data.Error || "no movies found for:" + term)
          continue;
        }

        allMovies = [...allMovies, ...data.description];

      } catch (err) {
        console.error(`Error fetching movies for "${term}":`, err);
        setErrorMessage(err.message);
      }
    }
    return allMovies;
  }

  // function to fetch initial movies to display on homepage or fetch movies according to the search query
  const fetchInitialMovies = async (query = '') => {
    setIsLoading(true);
    let movies = [];
    if (query.trim() === '') {
      const randomTerms = getRandomTerms(popularSearches, 12); // fetch 8 random topics per load
      console.log("🎬 Fetching random topics:", randomTerms);

      const temp = await getMovies(randomTerms);

      temp.sort((a, b) => {
        const rankA = parseInt(a['#RANK']) || Infinity;
        const rankB = parseInt(b['#RANK']) || Infinity;
        return rankA - rankB;
      });

      movies = temp.slice(0,36);

    } else {
      movies = await getMovies([query])
      if (movies.length > 0) {
        updateSearchCount(query, movies[0])
      }
    }
    console.log(movies);

    setMovieList(movies);
    setIsLoading(false);

  };

  useEffect(() => {
    fetchInitialMovies(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  return (
    <main>
      <div className='pattern' />

      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="hero banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy, Without any Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>all movies</h2>

          {isLoading ? (<span className='loader'></span>) :
            errorMessage ? (<p className='text-red-500'>
              {errorMessage}
            </p>) :
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie['#IMDB_ID']} movie={movie} />
                ))}
              </ul>
          }
        </section>
      </div>
    </main>
  )
}

export default App

