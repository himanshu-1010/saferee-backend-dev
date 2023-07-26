const { ApplicationError } = require("../libs/errorLib");

// can invite guardians or not
exports.canInviteGuardian = async (req, res, next) => {
  try {
    if (req?.user?.inviteGuardians === false) {
      throw new ApplicationError(
        `You are not allowed to invite the guardian. Please connect with your administrator.`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// can become guardians or not
exports.canBecomeGuardian = async (req, res, next) => {
  try {
    if (req?.user?.becomeGuardians === false) {
      throw new ApplicationError(
        `You are not allowed to become the guardian. Please connect with your administrator.`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// can remove guardians or not
exports.canRemoveGuardian = async (req, res, next) => {
  try {
    if (req?.user?.deleteGuardians === false) {
      throw new ApplicationError(
        `You are not allowed to remove the guardian. Please connect with your administrator.`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// can stop being a guardian
exports.canStopBeingGuardian = async (req, res, next) => {
  try {
    if (req?.user?.stopBeingGuardian === false) {
      throw new ApplicationError(
        `You are not allowed to stop being the guardian. Please connect with your administrator.`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
