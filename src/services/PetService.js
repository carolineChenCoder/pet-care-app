import AsyncStorage from '@react-native-async-storage/async-storage';

class PetService {
  constructor() {
    this.petsKey = 'petProfiles';
    this.currentPetKey = 'currentPetId';
    this.reportsKey = 'healthReports';
  }

  // Generate unique ID for pets
  generateId() {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get all pets
  async getAllPets() {
    try {
      const petsData = await AsyncStorage.getItem(this.petsKey);
      return petsData ? JSON.parse(petsData) : [];
    } catch (error) {
      console.error('Error loading pets:', error);
      return [];
    }
  }

  // Add new pet
  async addPet(petData) {
    try {
      const pets = await this.getAllPets();
      const newPet = {
        id: this.generateId(),
        name: petData.name,
        breed: petData.breed,
        age: petData.age,
        gender: petData.gender,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      pets.push(newPet);
      await AsyncStorage.setItem(this.petsKey, JSON.stringify(pets));

      // If this is the first pet, make it current
      if (pets.length === 1) {
        await this.setCurrentPet(newPet.id);
      }

      return newPet;
    } catch (error) {
      console.error('Error adding pet:', error);
      throw error;
    }
  }

  // Update pet
  async updatePet(petId, petData) {
    try {
      const pets = await this.getAllPets();
      const petIndex = pets.findIndex(pet => pet.id === petId);
      
      if (petIndex === -1) {
        throw new Error('Pet not found');
      }

      pets[petIndex] = {
        ...pets[petIndex],
        name: petData.name,
        breed: petData.breed,
        age: petData.age,
        gender: petData.gender,
        updatedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(this.petsKey, JSON.stringify(pets));
      return pets[petIndex];
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  }

  // Delete pet
  async deletePet(petId) {
    try {
      const pets = await this.getAllPets();
      const filteredPets = pets.filter(pet => pet.id !== petId);
      
      await AsyncStorage.setItem(this.petsKey, JSON.stringify(filteredPets));
      
      // If deleted pet was current, set new current pet
      const currentPetId = await this.getCurrentPetId();
      if (currentPetId === petId) {
        const newCurrentId = filteredPets.length > 0 ? filteredPets[0].id : null;
        await this.setCurrentPet(newCurrentId);
      }

      // Delete pet's reports
      await this.deleteAllReportsForPet(petId);
      
      return true;
    } catch (error) {
      console.error('Error deleting pet:', error);
      throw error;
    }
  }

  // Get current pet ID
  async getCurrentPetId() {
    try {
      return await AsyncStorage.getItem(this.currentPetKey);
    } catch (error) {
      console.error('Error getting current pet ID:', error);
      return null;
    }
  }

  // Set current pet
  async setCurrentPet(petId) {
    try {
      console.log('🔧 PetService: Setting current pet ID:', petId);
      if (petId) {
        await AsyncStorage.setItem(this.currentPetKey, petId);
        console.log('✅ PetService: Current pet ID saved successfully');
      } else {
        await AsyncStorage.removeItem(this.currentPetKey);
        console.log('✅ PetService: Current pet ID cleared');
      }
    } catch (error) {
      console.error('Error setting current pet:', error);
    }
  }

  // Get current pet
  async getCurrentPet() {
    try {
      const currentPetId = await this.getCurrentPetId();
      console.log('🔍 PetService: Current pet ID from storage:', currentPetId);
      if (!currentPetId) return null;

      const pets = await this.getAllPets();
      const currentPet = pets.find(pet => pet.id === currentPetId) || null;
      console.log('🐾 PetService: Found current pet:', currentPet?.name || 'Not found');
      return currentPet;
    } catch (error) {
      console.error('Error getting current pet:', error);
      return null;
    }
  }

  // Save health report for specific pet
  async saveHealthReport(petId, reportData) {
    try {
      const reportsData = await AsyncStorage.getItem(this.reportsKey);
      const reports = reportsData ? JSON.parse(reportsData) : {};

      if (!reports[petId]) {
        reports[petId] = [];
      }

      const report = {
        id: this.generateId(),
        petId: petId,
        report: reportData.report,
        reportType: reportData.reportType || 'comprehensive',
        generatedAt: new Date().toISOString(),
        source: reportData.source || 'unknown'
      };

      reports[petId].unshift(report); // Add to beginning
      
      // Keep only last 10 reports per pet
      reports[petId] = reports[petId].slice(0, 10);

      await AsyncStorage.setItem(this.reportsKey, JSON.stringify(reports));
      return report;
    } catch (error) {
      console.error('Error saving health report:', error);
      throw error;
    }
  }

  // Get health reports for specific pet
  async getHealthReports(petId) {
    try {
      const reportsData = await AsyncStorage.getItem(this.reportsKey);
      const reports = reportsData ? JSON.parse(reportsData) : {};
      return reports[petId] || [];
    } catch (error) {
      console.error('Error getting health reports:', error);
      return [];
    }
  }

  // Get latest health report for pet
  async getLatestHealthReport(petId) {
    try {
      const reports = await this.getHealthReports(petId);
      return reports.length > 0 ? reports[0] : null;
    } catch (error) {
      console.error('Error getting latest health report:', error);
      return null;
    }
  }

  // Delete all reports for a pet
  async deleteAllReportsForPet(petId) {
    try {
      const reportsData = await AsyncStorage.getItem(this.reportsKey);
      const reports = reportsData ? JSON.parse(reportsData) : {};
      
      if (reports[petId]) {
        delete reports[petId];
        await AsyncStorage.setItem(this.reportsKey, JSON.stringify(reports));
      }
    } catch (error) {
      console.error('Error deleting reports for pet:', error);
    }
  }

  // Delete specific report
  async deleteHealthReport(petId, reportId) {
    try {
      const reportsData = await AsyncStorage.getItem(this.reportsKey);
      const reports = reportsData ? JSON.parse(reportsData) : {};
      
      if (reports[petId]) {
        reports[petId] = reports[petId].filter(report => report.id !== reportId);
        await AsyncStorage.setItem(this.reportsKey, JSON.stringify(reports));
      }
    } catch (error) {
      console.error('Error deleting health report:', error);
    }
  }

  // Migrate old single pet data to new multi-pet system
  async migrateOldData() {
    try {
      // Check if old data exists
      const oldProfile = await AsyncStorage.getItem('petProfile');
      const oldReport = await AsyncStorage.getItem('lastHealthReport');
      
      if (oldProfile) {
        const profile = JSON.parse(oldProfile);
        
        // Add as first pet if no pets exist
        const existingPets = await this.getAllPets();
        if (existingPets.length === 0) {
          const newPet = await this.addPet({
            name: profile.name,
            breed: profile.breed,
            age: profile.age,
            gender: profile.gender
          });

          // Migrate old report if exists
          if (oldReport) {
            const reportData = JSON.parse(oldReport);
            await this.saveHealthReport(newPet.id, {
              report: reportData.report,
              reportType: 'comprehensive',
              source: 'migrated'
            });
            
            // Remove old report
            await AsyncStorage.removeItem('lastHealthReport');
          }
        }
        
        // Remove old profile
        await AsyncStorage.removeItem('petProfile');
        console.log('✅ Successfully migrated old pet data');
      }
    } catch (error) {
      console.error('Error migrating old data:', error);
    }
  }

  // Get summary statistics
  async getStats() {
    try {
      const pets = await this.getAllPets();
      const reportsData = await AsyncStorage.getItem(this.reportsKey);
      const reports = reportsData ? JSON.parse(reportsData) : {};
      
      let totalReports = 0;
      Object.keys(reports).forEach(petId => {
        totalReports += reports[petId].length;
      });

      return {
        totalPets: pets.length,
        totalReports: totalReports,
        petsWithReports: Object.keys(reports).length
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { totalPets: 0, totalReports: 0, petsWithReports: 0 };
    }
  }
}

export default PetService;