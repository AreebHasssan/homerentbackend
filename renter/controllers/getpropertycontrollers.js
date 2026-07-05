const Auth = require("../../auth/models/authmodel");
const Profile = require("../../common/models/profilemodel");
const Property = require("../../propertyowner/models/postmodel");

const getRenterDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (req.user.role !== "renter") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: renter access only",
      });
    }

    const [authUser, profile, rawProperties] = await Promise.all([
      Auth.findById(userId)
        .select("_id name email role memberSince darkMode language")
        .lean(),
      Profile.findOne({ userId }).select("about image").lean(),
      Property.find()
        .select(
          "userId propertytitle propertytype price location latitude longitude additional about bedrooms bathrooms image",
        )
        .lean(),
    ]);

    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ownerIds = Array.from(
      new Set(
        rawProperties
          .map((property) => String(property.userId || ""))
          .filter(Boolean),
      ),
    );

    const owners = ownerIds.length
      ? await Auth.find({ _id: { $in: ownerIds } })
          .select("_id name email role")
          .lean()
      : [];

    const ownerById = new Map(
      owners.map((owner) => [String(owner._id), owner]),
    );

    const properties = rawProperties.map((property) => {
      const ownerId = String(property.userId);
      const owner = ownerById.get(ownerId);

      return {
        id: property._id,
        userid: ownerId,
        userId: ownerId,
        propertytitle: property.propertytitle,
        propertytype: property.propertytype,
        price: property.price,
        location: property.location,
        latitude: property.latitude,
        longitude: property.longitude,
        additional: property.additional,
        about: property.about,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        image: property.image,
        gallery: property.gallery,
        owner: owner
          ? {
              id: owner._id,
              name: owner.name,
              username: owner.name,
              email: owner.email,
              role: owner.role,
              profile: {
                about: "",
                image: "",
              },
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      user: {
        id: authUser._id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        memberSince: authUser.memberSince,
        darkMode: authUser.darkMode,
        language: authUser.language,
        profile: profile
          ? {
              about: profile.about || "",
              image: profile.image || "",
            }
          : {
              about: "",
              image: "",
            },
      },
      properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  getRenterDashboard,
};
