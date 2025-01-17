const meeseOS = require("meeseOS");
const Auth = require("../src/auth.js");
const { Response } = require("jest-express/lib/response");
const { Request } = require("jest-express/lib/request");

describe("Authentication", () => {
	let core;
	let auth;
	let request;
	let response;

	const profile = {
		id: 0,
		username: "jest",
		name: "jest",
		groups: [],
	};

	beforeEach(() => {
		request = new Request();
		request.session = {
			save: jest.fn((cb) => cb()),
			destroy: jest.fn((cb) => cb()),
		};

		response = new Response();
	});

	afterEach(() => {
		request.resetMocked();
		response.resetMocked();
	});

	beforeAll(() => meeseOS().then((c) => (core = c)));
	afterAll(() => core.destroy());

	test("#constructor", () => {
		auth = new Auth(core);
	});

	test("#constructor - should fall back to null adapter", () => {
		auth = new Auth(core, {
			adapter: () => {
				throw new Error("Simulated failure");
			},
			denyUsers: ["jestdeny"],
		});

		expect(auth.adapter).not.toBe(null);
	});

	test("#init", () => {
		return expect(auth.init()).resolves.toBe(true);
	});

	test("#login - fail on error", async () => {
		await auth.login(request, response);

		expect(response.status).toBeCalledWith(403);
		expect(response.json).toBeCalledWith({
			error: "Invalid login or permission denied",
		});
	});

	test("#login - success", async () => {
		request.setBody({ username: "jest", password: "jest" });

		await auth.login(request, response);

		expect(response.status).toBeCalledWith(200);
		expect(request.session.user).toEqual(profile);
		expect(request.session.save).toBeCalled();
		expect(response.json).toBeCalledWith(profile);
	});

	test("#login - fail on denied user", async () => {
		request.setBody({ username: "jestdeny", password: "jest" });

		await auth.login(request, response);

		expect(response.status).toBeCalledWith(403);
		expect(response.json).toBeCalledWith({
			error: "Invalid login or permission denied",
		});
	});

	test("#login - fail on missing groups", async () => {
		auth.options.requiredGroups = ["required"];

		request.setBody({ username: "jest", password: "jest" });

		await auth.login(request, response);

		expect(response.status).toBeCalledWith(403);
		expect(response.json).toBeCalledWith({
			error: "Invalid login or permission denied",
		});
	});

	test("#logout", async () => {
		await auth.logout(request, response);

		expect(request.session.destroy).toBeCalled();
		expect(response.json).toBeCalledWith({});
	});

	test("#register", async () => {
		request.setBody({ username: "jest", password: "jest" });

		await auth.register(request, response);

		expect(response.json).toBeCalledWith({ username: "jest" });
	});

	test("#destroy", async () => {
		await auth.destroy();
		auth = undefined;
	});
});
