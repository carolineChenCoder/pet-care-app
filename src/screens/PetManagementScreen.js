import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import PetService from '../services/PetService';

const PetManagementScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [petService] = useState(new PetService());
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  
  // Form fields
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petGender, setPetGender] = useState('unknown');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Migrate old data first
      await petService.migrateOldData();
      
      // Load pets and current pet
      const allPets = await petService.getAllPets();
      const current = await petService.getCurrentPet();
      
      setPets(allPets);
      setCurrentPet(current);
      
      // If no pets and no form showing, show add form
      if (allPets.length === 0 && !showAddForm) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const resetForm = () => {
    setPetName('');
    setPetBreed('');
    setPetAge('');
    setPetGender('unknown');
    setEditingPet(null);
  };

  const handleSavePet = async () => {
    if (!petName.trim() || !petBreed.trim() || !petAge.trim() || !petGender) {
      Alert.alert('Missing Information', 'Please fill in all fields for your pet.');
      return;
    }

    try {
      const petData = {
        name: petName.trim(),
        breed: petBreed.trim(),
        age: petAge.trim(),
        gender: petGender
      };

      if (editingPet) {
        // Update existing pet
        await petService.updatePet(editingPet.id, petData);
        Alert.alert('✅ Updated!', `${petName}'s profile has been updated successfully!`);
      } else {
        // Add new pet
        const newPet = await petService.addPet(petData);
        Alert.alert('✅ Added!', `${petName} has been added to your pets!`);
        
        // If this is the first pet, make it current
        if (pets.length === 0) {
          await petService.setCurrentPet(newPet.id);
        }
      }

      resetForm();
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('❌ Save Failed', 'Sorry, couldn\'t save your pet\'s profile. Please try again!');
    }
  };

  const handleEditPet = (pet) => {
    setPetName(pet.name);
    setPetBreed(pet.breed);
    setPetAge(pet.age);
    setPetGender(pet.gender);
    setEditingPet(pet);
    setShowAddForm(true);
  };

  const handleDeletePet = (pet) => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}? This will also delete all their health reports.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await petService.deletePet(pet.id);
              Alert.alert('✅ Deleted', `${pet.name} has been removed from your pets.`);
              loadData();
            } catch (error) {
              console.error('Error deleting pet:', error);
              Alert.alert('❌ Delete Failed', 'Sorry, couldn\'t delete the pet. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSetCurrentPet = async (pet) => {
    try {
      await petService.setCurrentPet(pet.id);
      setCurrentPet(pet);
      Alert.alert('🐾 Active Pet Changed', `${pet.name} is now your active pet for health reports and symptom analysis.`);
    } catch (error) {
      console.error('Error setting current pet:', error);
    }
  };

  const handleCancelForm = () => {
    resetForm();
    setShowAddForm(false);
  };

  const renderPetCard = ({ item: pet }) => (
    <View style={[styles.petCard, currentPet?.id === pet.id && styles.currentPetCard]}>
      <View style={styles.petHeader}>
        <Text style={styles.petName}>🐾 {pet.name}</Text>
        {currentPet?.id === pet.id && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Active</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.petInfo}>🏷️ Breed: {pet.breed}</Text>
      <Text style={styles.petInfo}>🎂 Age: {pet.age}</Text>
      <Text style={styles.petInfo}>
        ⚥ Gender: {pet.gender === 'male' ? 'Male' : pet.gender === 'female' ? 'Female' : 'Unknown'}
      </Text>
      
      <View style={styles.petActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSetCurrentPet(pet)}
          disabled={currentPet?.id === pet.id}
        >
          <Text style={styles.actionButtonText}>
            {currentPet?.id === pet.id ? '✓ Active' : 'Set Active'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPet(pet)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePet(pet)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>Pet Management</Text>
        <Text style={styles.subtitle}>Manage your pets and their profiles</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>📊 Total Pets: {pets.length}</Text>
        {currentPet && (
          <Text style={styles.activeText}>🎯 Active: {currentPet.name}</Text>
        )}
      </View>

      {/* Add Pet Button */}
      {!showAddForm && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>➕ Add New Pet</Text>
        </TouchableOpacity>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingPet ? `✏️ Edit ${editingPet.name}` : '➕ Add New Pet'}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🐕 Pet Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your pet's name"
              placeholderTextColor={colors.secondary}
              value={petName}
              onChangeText={setPetName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🏷️ Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Golden Retriever, Mixed, etc."
              placeholderTextColor={colors.secondary}
              value={petBreed}
              onChangeText={setPetBreed}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🎂 Age (years)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2, 5, 10"
              placeholderTextColor={colors.secondary}
              value={petAge}
              onChangeText={setPetAge}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>⚥ Gender</Text>
            <View style={styles.genderContainer}>
              {['male', 'female', 'unknown'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    petGender === gender && styles.genderButtonSelected
                  ]}
                  onPress={() => setPetGender(gender)}
                >
                  <Text style={[
                    styles.genderButtonText,
                    petGender === gender && styles.genderButtonTextSelected
                  ]}>
                    {gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Unknown'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity 
              style={[styles.formButton, styles.cancelButton]}
              onPress={handleCancelForm}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.formButton}
              onPress={handleSavePet}
            >
              <Text style={styles.saveButtonText}>
                {editingPet ? 'Update Pet' : 'Save Pet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pets List */}
      {pets.length > 0 && !showAddForm && (
        <View style={styles.petsContainer}>
          <Text style={styles.petsTitle}>Your Pets</Text>
          <FlatList
            data={pets}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Empty State */}
      {pets.length === 0 && !showAddForm && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pets added yet</Text>
          <Text style={styles.emptySubtext}>Add your first pet to get started!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 5,
  },
  activeText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: colors.success,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 2,
    borderColor: colors.border,
  },
  genderButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  genderButtonTextSelected: {
    color: colors.surface,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  formButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.secondary,
  },
  cancelButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  petsContainer: {
    marginTop: 20,
  },
  petsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  petCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  currentPetCard: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  currentBadge: {
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.surface,
  },
  petInfo: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  petActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  editButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default PetManagementScreen;