import { describe, it, expect, vi, beforeEach } from "vitest";
import { OccurrenceRepository } from "../occurrence.repository";
import { OccurrenceType } from "../occurrence.schema";

describe("OccurrenceRepository", () => {
  let occurrenceRepository: OccurrenceRepository;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: vi.fn(),
      findById: vi.fn(),
      aggregate: vi.fn(),
      findOne: vi.fn(),
      findByIdAndUpdate: vi.fn(),
    };

    occurrenceRepository = new OccurrenceRepository(mockModel);
  });

  describe("save", () => {
    it("should successfully save and return an occurrence document", async () => {
      const mockData = {
        siteId: "site-1",
        droneId: "drone-1",
        type: OccurrenceType.intrusion,
        severity: 4,
        detectedAt: new Date().toISOString(),
      };

      const mockSavedResult = { _id: "occ-id-1", ...mockData };
      mockModel.create.mockResolvedValueOnce(mockSavedResult);

      const result = await occurrenceRepository.save(mockData as any);

      expect(mockModel.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockSavedResult);
    });
  });

  describe("findById", () => {
    it("should return an occurrence when a valid ID is provided", async () => {
      const mockId = "occ-id-1";
      const mockOccurrence = { _id: mockId, severity: 3 };
      mockModel.findById.mockResolvedValueOnce(mockOccurrence);

      const result = await occurrenceRepository.findById(mockId);

      expect(mockModel.findById).toHaveBeenCalledWith({ _id: mockId });
      expect(result).toEqual(mockOccurrence);
    });

    it("should return null when occurrence is not found by ID", async () => {
      mockModel.findById.mockResolvedValueOnce(null);

      const result = await occurrenceRepository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("find", () => {
    it("should execute aggregate with filters and dynamic priority sorting", async () => {
      const mockFilter = { siteId: "site-1" };
      const mockAggregatedResult = [
        { _id: "1", priority: 12, severity: 4, type: OccurrenceType.intrusion },
      ];

      mockModel.aggregate.mockResolvedValueOnce(mockAggregatedResult);

      const result = await occurrenceRepository.find(mockFilter);

      expect(mockModel.aggregate).toHaveBeenCalledTimes(1);

      const aggregatePipeline = mockModel.aggregate.mock.calls[0][0];
      expect(aggregatePipeline[0].$match).toEqual(mockFilter);
      expect(aggregatePipeline[1]).toHaveProperty("$addFields"); // typeWeight
      expect(aggregatePipeline[2]).toHaveProperty("$addFields"); // priority
      expect(aggregatePipeline[3].$sort).toEqual({
        priority: -1,
        detectedAt: -1,
      });

      expect(result).toEqual(mockAggregatedResult);
    });

    it("should handle empty filters correctly in aggregate pipeline", async () => {
      mockModel.aggregate.mockResolvedValueOnce([]);

      await occurrenceRepository.find({});

      const aggregatePipeline = mockModel.aggregate.mock.calls[0][0];
      expect(aggregatePipeline[0].$match).toEqual({});
    });
  });

  describe("findOne", () => {
    it("should find one occurrence matching the query", async () => {
      const query = { droneId: "drone-1" };
      const mockOccurrence = { _id: "occ-id-1", droneId: "drone-1" };

      mockModel.findOne.mockResolvedValueOnce(mockOccurrence);

      const result = await occurrenceRepository.findOne(query);

      expect(mockModel.findOne).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockOccurrence);
    });

    it("should pass empty object to findOne if no query is provided", async () => {
      mockModel.findOne.mockResolvedValueOnce(null);

      await occurrenceRepository.findOne();

      expect(mockModel.findOne).toHaveBeenCalledWith({});
    });
  });

  describe("update", () => {
    it("should update and return the updated occurrence document", async () => {
      const mockId = "occ-id-1";
      const updateData = { severity: 5 };
      const updatedMockResult = { _id: mockId, severity: 5 };

      mockModel.findByIdAndUpdate.mockResolvedValueOnce(updatedMockResult);

      const result = await occurrenceRepository.update(mockId, updateData);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        updateData,
        { new: true },
      );
      expect(result).toEqual(updatedMockResult);
    });
  });
});
