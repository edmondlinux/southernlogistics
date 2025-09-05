import User from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		const user = await User.create({ 
			name, 
			email, 
			password 
		});

		// Set simple session cookie
		res.cookie("userId", user._id.toString(), {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			// Set simple session cookie
			res.cookie("userId", user._id.toString(), {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			});

			// Check if user is admin by email domain or specific emails
			const adminEmails = [
				"admin@reptileglobal.com", 
				"helanavega5@gmail.com", // Add your admin email here
				// Add more admin emails as needed
			];
			
			const isAdmin = adminEmails.includes(user.email.toLowerCase());

			if (isAdmin) {
				// Return admin redirect information
				res.json({
					_id: user._id,
					name: user.name,
					email: user.email,
					isAdmin: true,
					redirectToAdmin: true
				});
			} else {
				res.json({
					_id: user._id,
					name: user.name,
					email: user.email,
					isAdmin: false
				});
			}
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		res.clearCookie("userId");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};



export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
