import React from 'react'

const MovieCard = ({movie: {
    '#TITLE': title , '#RANK': rank , '#IMG_POSTER': poster_path ,'#YEAR': release_date, '#ACTORS' : actors,
    '#IMDB_URL' : imdb_url
}}) => {
  return (
    <div className='movie-card'>
      <img src={poster_path? poster_path : '/no-movie.png'} alt={title} />
      <div className='mt-4'>
        <h3>{title}</h3>
        <div className='content'>

            <div className='rating'>
                <img src="star.svg" alt="Star icon" />
                <p>{rank? "rank: "+rank : "N/A"}</p>
            </div>

            <span>•</span>

            <p className='year'>
                {release_date? release_date : "N/A"}
            </p>
  
            <br />
            <p className='lang'>
                <span>•</span> Actors: {actors? actors+'. . . .' : "N/A"} <span>•</span>
            </p>

            <br />

            <p className='text-white'>
                more information: <a href={imdb_url} className='text-blue-600' target='_blank'>here</a>
            </p>
        </div>

      </div>
    </div>
  )
}

export default MovieCard
