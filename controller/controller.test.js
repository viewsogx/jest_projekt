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

describe("getMember (GET)", () => {
  const member = { _id: "123", name: "Cartman", age: 10 };
  const req = { params: { id: "123" } };
  test("létezik", () => expect(controller.getMember).toEqual(expect.any(Function)));
  test("meghívható és meghívja a modellt", async () => {
    Model.findById.mockResolvedValue(member);
    await controller.getMember(req, makeRes());
    expect(Model.findById).toHaveBeenCalled();
  });
  test("a megfelelő id-t adja át", async () => {
    Model.findById.mockResolvedValue(member);
    await controller.getMember(req, makeRes());
    expect(Model.findById).toHaveBeenCalledWith("123");
  });
  test("megtalált tagnál 200-at ad", async () => {
    Model.findById.mockResolvedValue(member);
    const res = makeRes();
    await controller.getMember(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(member);
  });
  test("hiányzó tagnál 404-et ad", async () => {
    Model.findById.mockResolvedValue(null);
    const res = makeRes();
    await controller.getMember(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("modellhiba esetén 500-at ad", async () => {
    Model.findById.mockRejectedValue(new Error("hiba"));
    const res = makeRes();
    await controller.getMember(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("updateMember (PATCH)", () => {
  const member = { _id: "123", name: "Cartman", age: 11 };
  const req = { params: { id: "123" }, body: { age: 11 } };
  test("létezik", () => expect(controller.updateMember).toEqual(expect.any(Function)));
  test("meghívható és meghívja a modellt", async () => {
    Model.findByIdAndUpdate.mockResolvedValue(member);
    await controller.updateMember(req, makeRes());
    expect(Model.findByIdAndUpdate).toHaveBeenCalled();
  });
  test("az id-t, body-t és opciókat adja át", async () => {
    Model.findByIdAndUpdate.mockResolvedValue(member);
    await controller.updateMember(req, makeRes());
    expect(Model.findByIdAndUpdate).toHaveBeenCalledWith("123", { age: 11 }, { new: true, runValidators: true });
  });
  test("siker esetén 200-at és a tagot adja", async () => {
    Model.findByIdAndUpdate.mockResolvedValue(member);
    const res = makeRes();
    await controller.updateMember(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(member);
  });
  test("hiányzó tagnál 404-et ad", async () => {
    Model.findByIdAndUpdate.mockResolvedValue(null);
    const res = makeRes();
    await controller.updateMember(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("modellhiba esetén 500-at ad", async () => {
    Model.findByIdAndUpdate.mockRejectedValue(new Error("hiba"));
    const res = makeRes();
    await controller.updateMember(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});


describe("deleteMember (DELETE)", () => {
  const member = { _id: "123", name: "Cartman", age: 10 };
  const req = { params: { id: "123" } };
  test("létezik", () => expect(controller.deleteMember).toEqual(expect.any(Function)));
  test("meghívható és meghívja a modellt", async () => {
    Model.findByIdAndDelete.mockResolvedValue(member);
    await controller.deleteMember(req, makeRes());
    expect(Model.findByIdAndDelete).toHaveBeenCalled();
  });
  test("a megfelelő id-t adja át", async () => {
    Model.findByIdAndDelete.mockResolvedValue(member);
    await controller.deleteMember(req, makeRes());
    expect(Model.findByIdAndDelete).toHaveBeenCalledWith("123");
  });
  test("siker esetén 200-at és a törölt tagot adja", async () => {
    Model.findByIdAndDelete.mockResolvedValue(member);
    const res = makeRes();
    await controller.deleteMember(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(member);
  });
  test("hiányzó tagnál 404-et ad", async () => {
    Model.findByIdAndDelete.mockResolvedValue(null);
    const res = makeRes();
    await controller.deleteMember(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("modellhiba esetén 500-at ad", async () => {
    Model.findByIdAndDelete.mockRejectedValue(new Error("hiba"));
    const res = makeRes();
    await controller.deleteMember(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});