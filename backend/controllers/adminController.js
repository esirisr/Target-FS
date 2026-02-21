import User from '../models/User.js';

/**
 * GET Dashboard Data
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ success: false, message: "User not found" });

    const userLocation = currentUser.location?.trim().toLowerCase() || '';

    const allPros = await User.find({ role: 'pro', email: { $ne: 'himiloone@gmail.com' } })
      .select('-password')
      .sort({ createdAt: -1 });

    if (role === 'admin') {
      return res.json({
        success: true,
        stats: {
          totalPros: allPros.length,
          pendingApprovals: allPros.filter(p => p.isVerified === false).length,
          livePros: allPros.filter(p => p.isVerified && !p.isSuspended).length,
          suspendedCount: allPros.filter(p => p.isSuspended).length
        },
        pros: allPros
      });
    }

    // CLIENT VIEW
    const matchedPros = allPros.filter(p => {
      const isVerified = Boolean(p.isVerified);
      const isSuspended = Boolean(p.isSuspended);
      const proLocation = p.location?.trim().toLowerCase() || '';
      return isVerified && !isSuspended && proLocation === userLocation;
    });

    res.json({ success: true, pros: matchedPros });
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

    res.json({ success: true, message: "Professional approved!", pro: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified } });
  } catch (error) {
    console.error("VerifyPro Error:", error);
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
      pro: { id: user._id, name: user.name, email: user.email, isSuspended: user.isSuspended }
    });
  } catch (error) {
    console.error("ToggleSuspension Error:", error);
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
    console.error("DeleteUser Error:", error);
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};
