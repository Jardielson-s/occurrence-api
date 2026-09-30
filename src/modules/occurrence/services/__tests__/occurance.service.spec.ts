import { describe, it, expect, vi, beforeEach } from "vitest";
import { OcurrenceService } from "../occurrence.service";
import { Status, OccurrenceType } from "../../occurrence.entity";

describe("OcurrenceService", () => {
  let occurrenceService: OcurrenceService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
    };

    occurrenceService = new OcurrenceService(mockRepository);
  });

  describe("createOccurrence", () => {
    it("should create a new occurrence when no duplicate exists within 10 minutes", async () => {
      const input = {
        siteId: "site-1",
        droneId: "drone-1",
        type: OccurrenceType.intrusion,
        severity: 3,
        status: Status.open,
      };

      mockRepository.findOne.mockResolvedValueOnce(null);

      const mockSavedOccurrence = {
        _id: "occ-1",
        ...input,
        count: 1,
        detectedAt: new Date(),
      };
      mockRepository.save.mockResolvedValueOnce(mockSavedOccurrence);

      const result = await occurrenceService.createOccurrence(input);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSavedOccurrence);
    });

    it("should update count and increment severity when a duplicate exists within 10 minutes", async () => {
      const input = {
        siteId: "site-1",
        droneId: "drone-1",
        type: OccurrenceType.intrusion,
        severity: 3,
        status: Status.open,
      };

      const existingOccurrence = {
        _id: "occ-1",
        siteId: "site-1",
        type: OccurrenceType.intrusion,
        count: 2,
        severity: 3,
        status: Status.open,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingOccurrence);

      const mockUpdatedOccurrence = {
        ...existingOccurrence,
        count: 3,
        severity: 4,
      };
      mockRepository.update.mockResolvedValueOnce(mockUpdatedOccurrence);

      const result = await occurrenceService.createOccurrence(input);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).toHaveBeenCalledWith("occ-1", {
        count: 3,
        severity: 4,
      });
      expect(result).toEqual(mockUpdatedOccurrence);
    });

    it("should cap severity at 5 if it reaches the maximum during duplicate update", async () => {
      const input = {
        siteId: "site-1",
        droneId: "drone-1",
        type: OccurrenceType.intrusion,
        severity: 5,
        status: Status.open,
      };

      const existingOccurrence = {
        _id: "occ-1",
        siteId: "site-1",
        type: OccurrenceType.intrusion,
        count: 5,
        severity: 5,
        status: Status.open,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingOccurrence);
      mockRepository.update.mockResolvedValueOnce({
        ...existingOccurrence,
        count: 6,
        severity: 5,
      });

      await occurrenceService.createOccurrence(input);

      expect(mockRepository.update).toHaveBeenCalledWith("occ-1", {
        count: 6,
        severity: 5,
      });
    });
  });

  describe("list", () => {
    it("should return a list of occurrences based on query", async () => {
      const mockList = [{ _id: "1", siteId: "site-1" }];
      mockRepository.find.mockResolvedValueOnce(mockList);

      const query = { siteId: "site-1" };
      const result = await occurrenceService.list(query);

      expect(mockRepository.find).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockList);
    });
  });

  describe("updateStatus", () => {
    it("should successfully transition status from open to acknowledged", async () => {
      const mockOccurrence = {
        _id: "occ-1",
        status: Status.open,
      };

      mockRepository.findOne.mockResolvedValueOnce(mockOccurrence);
      const updatedResult = {
        ...mockOccurrence,
        status: Status.acknowledged,
        note: "Checked",
      };
      mockRepository.update.mockResolvedValueOnce(updatedResult);

      const result = await occurrenceService.updateStatus(
        "occ-1",
        Status.acknowledged,
        "Checked",
      );

      expect(mockRepository.update).toHaveBeenCalledWith("occ-1", {
        status: Status.acknowledged,
        note: "Checked",
      });
      expect(result).toEqual(updatedResult);
    });

    it("should throw an error if occurrence is not found", async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        occurrenceService.updateStatus(
          "invalid-id",
          Status.acknowledged,
          "Note",
        ),
      ).rejects.toThrow("Occurrance not found");
    });

    it("should throw an error on invalid status transition (e.g. open directly to resolved)", async () => {
      const mockOccurrence = {
        _id: "occ-1",
        status: Status.open,
      };

      mockRepository.findOne.mockResolvedValueOnce(mockOccurrence);

      await expect(
        occurrenceService.updateStatus("occ-1", Status.resolved, "Note"),
      ).rejects.toThrow("Invalid status");
    });

    it("should throw an error trying to update a status that is already resolved", async () => {
      const mockOccurrence = {
        _id: "occ-1",
        status: Status.resolved,
      };

      mockRepository.findOne.mockResolvedValueOnce(mockOccurrence);

      await expect(
        occurrenceService.updateStatus("occ-1", Status.acknowledged, "Note"),
      ).rejects.toThrow("Invalid status");
    });
  });
});
