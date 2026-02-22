import User from '../models/User.js';

/**
 * GET Dashboard Data with Role & Location Filtering
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userLocation = currentUser.location?.trim().toLowerCase() || '';

    const allPros = await User.find({
      role: 'pro',
      email: { $ne: 'himiloone@gmail.com' }
    }).lean();

    // ADMIN VIEW
    if (role === 'admin') {
      return res.json({
        success: true,
        stats: {
          totalPros: allPros.length,
          pendingApprovals: allPros.filter(p => !p.isVerified).length,
          livePros: allPros.filter(p => p.isVerified && !p.isSuspended).length,
          suspendedCount: allPros.filter(p => p.isSuspended).length
        },
        allPros
      });
    }

    // CLIENT VIEW (location match + privacy)
    const matchedPros = allPros
      .filter(p => {
        const isVerified = p.isVerified === true || String(p.isVerified) === 'true';
        const isSuspended = p.isSuspended === true || String(p.isSuspended) === 'true';
        const proLocation = p.location?.trim().toLowerCase() || '';

        return isVerified && !isSuspended && proLocation === userLocation;
      })
      .map(p => ({
        _id: p._id,
        name: p.name,
        email: p.email,
        location: p.location,
        skills: p.skills,
        rating: p.rating,
        reviewCount: p.reviewCount
        // phone removed
      }));

    res.json({ success: true, allPros: matchedPros });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * APPROVE Professional
 */
export const verifyPro = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: "Professional Approved!", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/**
 * TOGGLE Suspension
 */
export const toggleSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      success: true,
      message: user.isSuspended ? "Professional Suspended" : "Professional Reinstated",
      isSuspended: user.isSuspended
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Suspension toggle failed" });
  }
};

/**
 * DELETE User
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};