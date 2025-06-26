import ServiceError from '../core/serviceError'; 

const handleDBError = (error: any) => {
  const { code = '', message } = error;

  if (code === 'P2002') {
    switch (true) {
      case message.inclusdes('idx_user_name_unique'):
        throw ServiceError.validationFailed('A user with this name already exists');
      default:
        throw ServiceError.validationFailed('This item already exists');
    }
  }

  if (code === 'P2025') {
    switch (true) {
      case message.includes('fk_transaction_user'):
        throw ServiceError.notFound('This user does not exist');
      case message.includes('user'):
        throw ServiceError.notFound('No user with this id exists');
    }
  }

  if (code === 'P2003') {
    switch (true) {
      case message.includes('user_id'):
        throw ServiceError.conflict(
          'This user does not exist',
        );
    }
  }

  // Rethrow error because we don't know what happened
  throw error;
};

export default handleDBError;