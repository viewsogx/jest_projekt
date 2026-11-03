jest.mock("../model/model", () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const Model = require("../model/model");
const controller = require("./controller");

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

beforeEach(() => jest.clearAllMocks());



describe("createMember (POST)", () => {
  const body = { name: "Cartman", age: 10 };
  test("létezik", () => expect(controller.createMember).toEqual(expect.any(Function)));
  test("meghívható", async () => {
    Model.create.mockResolvedValue(body);
    await controller.createMember({ body }, makeRes());
    expect(Model.create).toHaveBeenCalled();
  });
  test("a body-t adja át", async () => {
    Model.create.mockResolvedValue(body);
    await controller.createMember({ body }, makeRes());
    expect(Model.create).toHaveBeenCalledWith(body);
  });
  test("siker esetén 201-et és a tagot adja", async () => {
    Model.create.mockResolvedValue(body);
    const res = makeRes();
    await controller.createMember({ body }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(body);
  });
  test("modellhiba esetén 500-at ad", async () => {
    Model.create.mockRejectedValue(new Error("hiba"));
    const res = makeRes();
    await controller.createMember({ body }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
  test("a hibaüzenetet adja vissza", async () => {
    Model.create.mockRejectedValue(new Error("hiba"));
    const res = makeRes();
    await controller.createMember({ body }, res);
    expect(res.json).toHaveBeenCalledWith({ message: "hiba" });
  });
});