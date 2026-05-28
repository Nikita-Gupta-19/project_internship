import { validationResult } from 'express-validator';

/**
 * Middleware wrapper for express-validator rules.
 * Runs validations concurrently and formats error response on failure.
 * @param {Array} validations - Array of validation chains (e.g. body('email').isEmail())
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations sequentially or in parallel
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        location: err.location
      })),
    });
  };
};
