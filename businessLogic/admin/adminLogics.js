const {
  Admin,
  MasterAdmin,
  Groups,
  SubGroups,
  MasterUser,
  User,
  Support,
  Alarms,
  Guardian,
  FollowMe,
} = require("../../db");
const {
  hashPassword,
  comparePasswordSync,
  generateRandomPassword,
} = require("../../libs/passwordLib");
const { ApplicationError } = require("../../libs/errorLib");
const {
  map: _map,
  includes: _includes,
  find: _find,
  defaultTo: _defaultTo,
  random: _random,
  pick: _pick,
  keys: _keys,
  first: _first,
  capitalize: _capitalize,
} = require("lodash");
const {
  GuardianRequestStatus,
  SosAlarmStopReasons,
} = require("../../config/constants");
const moment = require("moment");

// update password
exports.updatePassword = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const { currentPassword, newPassword } = reqBody;

    const AdminCollection = Admin?.collection(reqUser?.orgDb);

    // check if current password is correct or not
    if (
      !comparePasswordSync({
        hashedText: reqUser?.password,
        plainText: currentPassword,
      })
    ) {
      throw new ApplicationError(`Current password is wrong`);
    }

    const payload = {
      password: hashPassword(newPassword),
    };

    // update password
    await AdminCollection?.updateOne(
      { adminId: reqUser?.adminId },
      { $set: payload }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

//#region groups management

// update groups
exports.groupsUpdate = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const { id, name, description } = reqBody;

    const GroupsCollection = Groups?.collection(reqUser?.orgDb);

    if (!id) {
      const payload = {
        ...Groups?.defaultPayload(),
        name,
        description,
      };
      await GroupsCollection?.insertOne(payload);
    } else {
      const groupRecord = await GroupsCollection?.findOne({
        groupId: id,
        isPublished: true,
      });
      if (!groupRecord) {
        throw new ApplicationError(`No such group found`);
      }
      await GroupsCollection?.updateOne(
        { groupId: id, isPublished: true },
        { $set: { name, description } }
      );
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// get all groups
exports.groupsFetchAll = async ({ reqUser = {} }) => {
  try {
    const GroupsCollection = Groups?.collection(reqUser?.orgDb);
    const list = await GroupsCollection?.find(
      { isPublished: true },
      {
        projection: { _id: 0, groupId: 1, name: 1, description: 1, created: 1 },
      }
    )?.toArray();
    return list;
  } catch (error) {
    throw error;
  }
};

// delete groups
exports.groupsDelete = async ({ groupId = undefined, reqUser = {} }) => {
  try {
    const GroupsCollection = Groups?.collection(reqUser?.orgDb);
    const UserCollection = User?.collection(reqUser?.orgDb);

    const groupRecord = await GroupsCollection?.findOne({
      groupId,
      isPublished: true,
    });
    if (!groupRecord) {
      throw new ApplicationError(`No such group found`);
    }
    const userExist = await UserCollection?.countDocuments({ groupId });
    if (userExist > 0) {
      throw new ApplicationError(
        `Cannot delete this group as it already has some user mapped with it`
      );
    }
    await GroupsCollection?.updateOne(
      { groupId, isPublished: true },
      { $set: { isPublished: false } }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

//#endregion

//#region sub-groups management

// update sub-groups
exports.subGroupsUpdate = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const { id, groupId, name, description } = reqBody;

    const GroupsCollection = Groups?.collection(reqUser?.orgDb);
    const SubGroupsCollection = SubGroups?.collection(reqUser?.orgDb);

    const groupRecord = await GroupsCollection?.findOne({
      groupId,
      isPublished: true,
    });

    if (!groupRecord) {
      throw new ApplicationError(`No such group found`);
    }

    if (!id) {
      const payload = {
        ...SubGroups?.defaultPayload(),
        groupId,
        name,
        description,
      };
      await SubGroupsCollection?.insertOne(payload);
    } else {
      const subGroupRecord = await SubGroupsCollection?.findOne({
        subGroupId: id,
        isPublished: true,
      });
      if (!subGroupRecord) {
        throw new ApplicationError(`No such sub-group found`);
      }
      await SubGroupsCollection?.updateOne(
        { subGroupId: id, isPublished: true },
        { $set: { name, description, groupId } }
      );
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// get all sub-groups
exports.subGroupsFetchAll = async ({ reqUser = {}, groupId = undefined }) => {
  try {
    const SubGroupsCollection = SubGroups?.collection(reqUser?.orgDb);
    const filters = { isPublished: true };
    if (groupId) {
      filters.groupId = groupId;
    }
    const list = await SubGroupsCollection?.aggregate([
      {
        $match: filters,
      },
      {
        $lookup: {
          from: "Groups",
          localField: "groupId",
          foreignField: "groupId",
          as: "group",
        },
      },
      {
        $unwind: {
          path: "$group",
        },
      },
      {
        $project: {
          _id: 0,
          subGroupId: 1,
          groupId: 1,
          name: 1,
          description: 1,
          created: 1,
          groupName: "$group.name",
          groupDescription: "$group.description",
        },
      },
    ])?.toArray();
    return list;
  } catch (error) {
    throw error;
  }
};

// delete sub-groups
exports.subGroupsDelete = async ({ subGroupId = undefined, reqUser = {} }) => {
  try {
    const SubGroupsCollection = SubGroups?.collection(reqUser?.orgDb);
    const UserCollection = User?.collection(reqUser?.orgDb);

    const subGroupRecord = await SubGroupsCollection?.findOne({
      subGroupId,
      isPublished: true,
    });
    if (!subGroupRecord) {
      throw new ApplicationError(`No such sub-group found`);
    }
    const userExist = await UserCollection?.countDocuments({ subGroupId });
    if (userExist > 0) {
      throw new ApplicationError(
        `Cannot delete this sub-group as it already has some user mapped with it`
      );
    }
    await SubGroupsCollection?.updateOne(
      { subGroupId, isPublished: true },
      { $set: { isPublished: false } }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

//#endregion

//#region users management

// get all users
exports.usersGetAll = async ({ reqUser = {}, query = {} }) => {
  try {
    const UserCollection = User?.collection(reqUser?.orgDb);

    const filterQuery = {};

    if (query?.groupId?.length > 0) {
      filterQuery.groupId = query?.groupId;
    }
    if (query?.subGroupId?.length > 0) {
      filterQuery.subGroupId = query?.subGroupId;
    }

    const users = await UserCollection?.aggregate([
      {
        $match: {
          isPublished: true,
          ...filterQuery,
        },
      },
      {
        $lookup: {
          from: "Groups",
          localField: "groupId",
          foreignField: "groupId",
          as: "groupRec",
        },
      },
      {
        $unwind: {
          path: "$groupRec",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "SubGroups",
          localField: "subGroupId",
          foreignField: "subGroupId",
          as: "subGroupRec",
        },
      },
      {
        $unwind: {
          path: "$subGroupRec",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "Guardian",
          let: {
            userId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$requestFrom.userId", "$$userId"],
                },
                isPublished: true,
                requestStatus: GuardianRequestStatus?.Approved,
              },
            },
            {
              $lookup: {
                from: "User",
                localField: "requestTo.userId",
                foreignField: "userId",
                as: "guardianUser",
              },
            },
            {
              $project: {
                names: "$guardianUser.name",
                userIds: "$guardianUser.userId",
              },
            },
          ],
          as: "guardians",
        },
      },
      {
        $unwind: {
          path: "$guardians",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "Guardian",
          let: {
            userId: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$requestTo.userId", "$$userId"],
                },
                isPublished: true,
                requestStatus: GuardianRequestStatus?.Approved,
              },
            },
            {
              $lookup: {
                from: "User",
                localField: "requestFrom.userId",
                foreignField: "userId",
                as: "myUser",
              },
            },
            {
              $project: {
                names: "$myUser.name",
                userIds: "$myUser.userId",
              },
            },
          ],
          as: "myUsers",
        },
      },
      {
        $unwind: {
          path: "$myUsers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          name: 1,
          phoneNumber: 1,
          mobile: 1,
          mobileCountryCode: 1,
          email: 1,
          isActive: 1,
          created: 1,
          lastModified: 1,
          inviteGuardians: 1,
          becomeGuardians: 1,
          deleteGuardians: 1,
          stopBeingGuardian: 1,
          groupId: 1,
          groupName: "$groupRec.name",
          subGroupId: 1,
          subGroupName: "$subGroupRec.name",
          guardians: 1,
          myUsers: 1,
        },
      },
    ])?.toArray();

    const data = _map(users, (elRec) => {
      const temp = {
        ...elRec,
        inviteGuardians: [true, false]?.includes(elRec?.inviteGuardians) ? elRec?.inviteGuardians : true,
        becomeGuardians: [true, false]?.includes(elRec?.becomeGuardians) ? elRec?.becomeGuardians : true,
        deleteGuardians: [true, false]?.includes(elRec?.deleteGuardians) ? elRec?.deleteGuardians : true,
        stopBeingGuardian: [true, false]?.includes(elRec?.stopBeingGuardian) ? elRec?.stopBeingGuardian : true,
        protectedBy: [],
        guardianOf: [],
      };
      if (
        elRec?.guardians?.names?.length > 0 &&
        elRec?.guardians?.userIds?.length == elRec?.guardians?.names?.length
      ) {
        elRec?.guardians?.names?.forEach((elName, indexName) => {
          temp?.protectedBy?.push({
            userId: elRec?.guardians?.userIds?.[indexName],
            name: elName,
          });
        });
      }
      if (
        elRec?.myUsers?.names?.length > 0 &&
        elRec?.myUsers?.userIds?.length == elRec?.myUsers?.names?.length
      ) {
        elRec?.myUsers?.names?.forEach((elName, indexName) => {
          temp?.guardianOf?.push({
            userId: elRec?.myUsers?.userIds?.[indexName],
            name: elName,
          });
        });
      }
      return temp;
    });

    return { success: true, message: `${users?.length} users found`, data };
  } catch (error) {
    throw error;
  }
};

// get all support tickets
exports.getSupportMails = async ({ reqUser = {} }) => {
  try {
    const SupportCollection = Support?.collection(reqUser?.orgDb);

    const supportTickets = await SupportCollection?.aggregate([
      {
        $match: {
          isPublished: true,
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "userId",
          foreignField: "userId",
          as: "userRec",
        },
      },
      {
        $unwind: {
          path: "$userRec",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$userRec",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          title: 1,
          description: 1,
          created: 1,
          name: `$userRec.name`,
          phoneNumber: `$userRec.phoneNumber`,
          mobile: `$userRec.mobile`,
          mobileCountryCode: `$userRec.mobileCountryCode`,
          email: `$userRec.email`,
        },
      },
    ])?.toArray();

    return {
      success: true,
      message: `${supportTickets?.length} users found`,
      data: supportTickets,
    };
  } catch (error) {
    throw error;
  }
};

// get all stats
exports.statsGetAll = async ({ reqUser = {}, query = {} }) => {
  try {
    const startDate = query?.startDate && moment(new Date(query?.startDate))?.isValid() ? moment(new Date(query?.startDate))?.utc()?.startOf("day") : undefined;
    const endDate = query?.endDate && moment(new Date(query?.endDate))?.isValid() ? moment(new Date(query?.endDate))?.utc()?.startOf("day") : undefined;
    const createdWhereCond = {};
    if(startDate) {
      createdWhereCond['$gte'] = startDate?.toISOString();
    }
    if(endDate) {
      createdWhereCond['$lte'] = endDate?.toISOString();
    }
    const matchDateCondition = {  };
    if(_keys(createdWhereCond)?.length > 0) {
      matchDateCondition.created = createdWhereCond;
    }
    const UserCollection = User?.collection(reqUser?.orgDb);
    const whereUserCond = { isPublished: true };
    if(query?.groupId) {
      whereUserCond.groupId = groupId;
    }
    if(query?.subGroupId) {
      whereUserCond.subGroupId = subGroupId;
    }
    const userIdFromDb = await UserCollection?.find(whereUserCond, { projection: { _id: 0, userId: 1 } })?.toArray();
    const userIds = _map(userIdFromDb, "userId");
    const AlarmsCollection = Alarms?.collection(reqUser?.orgDb);
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    const FollowMeCollection = FollowMe?.collection(reqUser?.orgDb);
    const dataSet = {
      alarms: [
        {
          value: await AlarmsCollection?.countDocuments({
            reasonId: SosAlarmStopReasons?.TestAlarm,
            userId: { $in: userIds },
            ...matchDateCondition
          }),
          text: `No. of test alarms`,
        },
        {
          value: await AlarmsCollection?.countDocuments({
            userId: { $in: userIds },
            $or: [
              { reasonId: { $exists: false } },
              { reasonId: { $ne: SosAlarmStopReasons?.TestAlarm } },
            ],
            ...matchDateCondition
          }),
          text: `No. of real alarms`,
        },
        {
          value: await AlarmsCollection?.countDocuments({
            userId: { $in: userIds },
            $expr: { $gte: [{ $size: "$guardianUserIds" }, 1] },
            $or: [
              { reasonId: { $exists: false } },
              { reasonId: { $ne: SosAlarmStopReasons?.TestAlarm } },
            ],
            ...matchDateCondition
          }),
          text: `No. of real alarms with Guardians responses`,
        },
        {
          value: (await AlarmsCollection?.aggregate([
            {
              $match: {
                userId: { $in: userIds },
                $expr: { $gte: [{ $size: "$guardianUserIds" }, 1] },
                $or: [
                  { reasonId: { $exists: false } },
                  { reasonId: { $ne: SosAlarmStopReasons?.TestAlarm } },
                ],
                ...matchDateCondition
              },
            },
            {
              $group: {
                _id: null,
                gLen: {
                  $sum: { $size: "$guardianUserIds" },
                },
              },
            },
          ])?.toArray())?.[0]?.gLen || 0,
          text: `No. of guardians that responded to the alarms`,
        },
      ],
      followMe: [
        {
          value: await FollowMeCollection?.countDocuments({ isPublished: true, userId: { $in: userIds } }),
          text: `No. of follow requests generated`,
        },
        {
          value: (await FollowMeCollection?.aggregate([
            {
              $match: {
                userId: { $in: userIds },
                $expr: { $gte: [{ $size: "$guardianUserIds" }, 1] },
                isPublished: true,
                ...matchDateCondition
              },
            },
            {
              $group: {
                _id: null,
                gLen: {
                  $sum: { $size: "$guardianUserIds" },
                },
              },
            },
          ])?.toArray())?.[0]?.gLen,
          text: `No. of guardians that responded to follow I'm here`,
        },
      ],
      invites: [
        {
          value: await GuardianCollection?.countDocuments({ isPublished: true, "requestFrom.userId": { $in: userIds }, ...matchDateCondition }),
          text: `No. of invites sent`,
        },
        {
          value: await GuardianCollection?.countDocuments({ isPublished: true, requestStatus: GuardianRequestStatus?.Approved, "requestFrom.userId": { $in: userIds }, ...matchDateCondition }),
          text: `No. of invites accepted`,
        },
        {
          value: await GuardianCollection?.countDocuments({ isPublished: true, requestStatus: GuardianRequestStatus?.Denied, "requestFrom.userId": { $in: userIds }, ...matchDateCondition }),
          text: `No. of invites rejected`,
        },
        {
          value: await GuardianCollection?.countDocuments({ isPublished: true, requestStatus: GuardianRequestStatus?.Cancelled, "requestFrom.userId": { $in: userIds }, ...matchDateCondition }),
          text: `No. of invites cancelled`,
        },
        {
          value: await GuardianCollection?.countDocuments({ isPublished: true, requestStatus: GuardianRequestStatus?.Removed, "requestFrom.userId": { $in: userIds }, ...matchDateCondition }),
          text: `No. of invites removed after acceptance`,
        },
      ],
    };

    const data = [
      {
        labels: _map(dataSet?.alarms, "text"),
        datasets: [
          {
            label: "Alarms",
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(255, 99, 132)",
            data: _map(dataSet?.alarms, "value"),
          },
        ],
        text: "Stats for SOS Alarms ",
      },
      {
        labels: _map(dataSet?.followMe, "text"),
        datasets: [
          {
            label: "Follow Me",
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(255, 99, 132)",
            data: _map(dataSet?.followMe, "value"),
          },
        ],
        text: "Stats for Inititated Follow Me ",
      },
      {
        labels: _map(dataSet?.invites, "text"),
        datasets: [
          {
            label: "Guardians Invites",
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(255, 99, 132)",
            data: _map(dataSet?.invites, "value"),
          },
        ],
        text: "Stats for guardian invites ",
      },
    ];

    return { success: true, message: `Success`, data };
  } catch (error) {
    throw error;
  }
};

// get all stats
exports.statsGetAllDetails = async ({ reqUser = {}, query = {} }) => {
  try {
    const startDate = query?.startDate && moment(new Date(query?.startDate))?.isValid() ? moment(new Date(query?.startDate))?.utc()?.startOf("day") : undefined;
    const endDate = query?.endDate && moment(new Date(query?.endDate))?.isValid() ? moment(new Date(query?.endDate))?.utc()?.startOf("day") : undefined;
    const createdWhereCond = {};
    if(startDate) {
      createdWhereCond['$gte'] = startDate?.toISOString();
    }
    if(endDate) {
      createdWhereCond['$lte'] = endDate?.toISOString();
    }
    const matchDateCondition = {  };
    if(_keys(createdWhereCond)?.length > 0) {
      matchDateCondition.created = createdWhereCond;
    }
    const UserCollection = User?.collection(reqUser?.orgDb);
    const whereUserCond = { isPublished: true };
    if(query?.groupId) {
      whereUserCond.groupId = groupId;
    }
    if(query?.subGroupId) {
      whereUserCond.subGroupId = subGroupId;
    }
    const userIdFromDb = await UserCollection?.find(whereUserCond, { projection: { _id: 0, userId: 1 } })?.toArray();
    const userIds = _map(userIdFromDb, "userId");

    const AlarmsCollection = Alarms?.collection(reqUser?.orgDb);

    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);

    const sosAlarmsFromDb = await AlarmsCollection?.aggregate([
      {
        $match: {
          isPublished: true,
          userId: { $in: userIds },
            ...matchDateCondition
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'userId',
          foreignField: 'userId',
          as: 'user'
        },
      },
      {
        $unwind: {
          path: '$user'
        }
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          alarmId: 1,
          location: 1,
          address: 1,
          description: 1,
          reasonTitle: 1,
          reasonDescription: 1,
          created: 1,
          guardianUserIds: 1,
          userName: '$user.name',
          userEail: '$user.email',
          userMobile: '$user.phoneNumber',
        },
      },
    ])?.toArray();

    const guardianInvitesFromDb = await GuardianCollection?.aggregate([
      {
        $match: {
          isPublished: true,
          "requestFrom.userId": { $in: userIds },
            ...matchDateCondition
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'requestFrom.userId',
          foreignField: 'userId',
          as: 'reqFromUser'
        },
      },
      {
        $unwind: {
          path: '$reqFromUser'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'requestTo.userId',
          foreignField: 'userId',
          as: 'reqToUser'
        },
      },
      {
        $unwind: {
          path: '$reqToUser'
        }
      },
      {
        $project: {
          _id: 0,
          guardianId: 1,
          reqFromUserId: `$reqFromUser.userId`,
          reqFromName: `$reqFromUser.name`,
          reqFromMobile: `$reqFromUser.email`,
          reqFromEmail: `$reqFromUser.mobile`,
          reqToUserId: `$reqToUser.userId`,
          reqToName: `$reqToUser.name`,
          reqToMobile: `$reqToUser.email`,
          reqToEmail: `$reqToUser.mobile`,
          requestStatus: 1,
          created: 1,
          removed: 1,
        },
      },
    ])?.toArray();

    const data = [
      {
        label: `SOS Alarms raised`,
        header: ["S.No.", "Name", "Email", "Mobile", "Timestamp", "Address", "Description", "Latitude", "Longitude", "Stop Reason", "Guardians"],
        body: _map(sosAlarmsFromDb, (elRec, indexRec) => {
          return { data: [ indexRec + 1, elRec?.userName, elRec?.userEmail, elRec?.userMobile, moment(new Date(elRec?.created))?.format("Do MMM, YYYY"), elRec?.address, elRec?.description, elRec?.location?.latitude, elRec?.location?.longitude, elRec?.reasonDescription, elRec?.guardianUserIds?.length ] };
        }),
      },
      {
        label: `Users alarms raised`,
        header: ["S.No.", "User Name", "User Email", "User Mobile", "Guardian Name", "Guardian Email", "Guardian Mobile", "Status", "Comments", "Timestamp"],
        body: _map(guardianInvitesFromDb, (elRec, indexRec) => {
          let comments = ``;
          switch (elRec?.requestStatus) {
            case GuardianRequestStatus?.Approved:
              comments = `Invitation accepted by the guardian`;
              break;
            case GuardianRequestStatus?.Denied:
              comments = `Invitation denied by the guardian`;
              break;
            case GuardianRequestStatus?.Cancelled:
              comments = `Invitation cancelled by the user`;
              break;
            case GuardianRequestStatus?.Invited:
            case GuardianRequestStatus?.Request:
              comments = `Requested by the user`;
              break;
            case GuardianRequestStatus?.Removed:
              comments = elRec?.removed?.userId == elRec?.reqFromUserId ? `Removed by the user` : `Removed by the guardian`;
              break;
            default:
              break;
          }
          return { data: [ indexRec + 1, elRec?.reqToName, elRec?.reqToEmail, elRec?.reqToMobile, elRec?.reqFromName, elRec?.reqFromEmail, elRec?.reqFromMobile, _capitalize(elRec?.requestStatus), comments , moment(new Date(elRec?.created))?.format("Do MMM, YYYY") ] };
        }),
      },
    ];

    return { success: true, message: `Success`, data };
  } catch (error) {
    throw error;
  }
};

// update users
exports.usersUpdate = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const { id, name, email, mobile, mobileCountryCode, groupId, subGroupId } =
      reqBody;

    /**
     * Check if email already exist or not
     */
    const emailInUse = await MasterUser?.collection?.countDocuments({
      email,
      userId: { $ne: id },
    });

    const UserCollection = User?.collection(reqUser?.orgDb);

    if (emailInUse) {
      throw new ApplicationError(`Email is already in use`);
    }

    const plainPassword = generateRandomPassword({ length: 8 });

    const payload = {
      ...User?.defaultPayload(),
      email,
      mobile,
      mobileCountryCode,
      name,
      groupId,
      subGroupId,
    };

    payload.phoneNumber = payload?.mobileCountryCode + payload?.mobile;

    if (!id) {
      payload.password = hashPassword(plainPassword);
    }

    const returnObj = {
      success: true,
      message: `User on-boarded successfully`,
    };
    if (!id) {
      /**
       * Create new user record
       */
      const createUser = await UserCollection?.insertOne(payload);

      if (!createUser?.acknowledged) {
        throw new ApplicationError(
          `Unable to onboard new user. Please try after some time.`
        );
      }

      // send email to user with credentials

      /**
       * Create new user record in the master users
       */
      await MasterUser?.insertOne(payload);
    } else {
      const recordUser = await UserCollection?.findOne({ userId: id });
      if (!recordUser) {
        throw new ApplicationError(`No such user found`);
      }
      const updatePayload = {
        email: payload?.email || recordUser?.email,
        mobile: payload?.mobile || recordUser?.mobile,
        mobileCountryCode:
          payload?.mobileCountryCode || recordUser?.mobileCountryCode,
        name: payload?.name || recordUser?.name,
        groupId: payload?.groupId || recordUser?.groupId,
        subGroupId: payload?.subGroupId || recordUser?.subGroupId,
        phoneNumber: payload?.phoneNumber || recordUser?.phoneNumber,
      };

      await UserCollection?.updateOne({ userId: id }, { $set: updatePayload });
      returnObj.message = `User account updated successfully`;
    }

    return returnObj;
  } catch (error) {
    throw error;
  }
};

// update user actions
exports.usersUpdateActions = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const returnObj = {
      success: true,
      message: `User updated successfully`,
    };

    const { userId, inviteGuardians, becomeGuardians, deleteGuardians, stopBeingGuardian } = reqBody;

    const UserCollection = User?.collection(reqUser?.orgDb);

    const recUser = await UserCollection?.findOne({ userId });
    if(!recUser) {
      throw new ApplicationError(`No such user found`);
    }

    const payload = {
      inviteGuardians: ["true", true, "false", false]?.includes(inviteGuardians) ? inviteGuardians : recUser?.inviteGuardians,
      becomeGuardians: ["true", true, "false", false]?.includes(becomeGuardians) ? becomeGuardians : recUser?.becomeGuardians,
      deleteGuardians: ["true", true, "false", false]?.includes(deleteGuardians) ? deleteGuardians : recUser?.deleteGuardians,
      stopBeingGuardian: ["true", true, "false", false]?.includes(stopBeingGuardian) ? stopBeingGuardian : recUser?.stopBeingGuardian,
    };

    console.log("payload", payload, "stopBeingGuardian", stopBeingGuardian, typeof stopBeingGuardian, ["true", true, "false", false]?.includes(stopBeingGuardian));

    await UserCollection?.updateOne({ userId }, { $set: payload });

    return returnObj;
  } catch (error) {
    throw error;
  }
};

//#endregion
