const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const {
  moviesBadRequestErrorMessage,
  moviesNotFoundErrorMessage,
  moviesForbiddenErrorMessage,
} = require('../utils/messages');

module.exports.getMyMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send({ data: movies }))
    .catch((err) => {
      next(err);
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    nameRU,
    nameEN,
    thumbnail,
    trailerLink,
    image,
    description,
    year,
    duration,
    director,
    country,
    movieId,
  } = req.body;
  Movie.create({
    nameRU,
    nameEN,
    thumbnail,
    trailerLink,
    image,
    description,
    year,
    duration,
    director,
    country,
    owner: req.user._id,
    movieId,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(err.message));
        return;
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => {
      throw new NotFoundError(moviesNotFoundErrorMessage);
    })
    .then((movie) => {
      if (movie.owner.toString() === req.user._id) {
        return movie.remove()
          .then((deletedMovie) => res.send({ data: deletedMovie }));
      }
      throw new ForbiddenError(moviesForbiddenErrorMessage);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(moviesBadRequestErrorMessage));
        return;
      }
      next(err);
    });
};
