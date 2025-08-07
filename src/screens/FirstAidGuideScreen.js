
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const FirstAidGuideScreen = () => {
  const { t } = useLanguage();
  
  const emergencyItems = [
    {
      emoji: '🫁',
      title: t('choking'),
      content: t('chokingText')
    },
    {
      emoji: '🩸',
      title: t('bleeding'),
      content: t('bleedingText')
    },
    {
      emoji: '🌡️',
      title: t('heatstroke'),
      content: t('heatstrokeText')
    },
    {
      emoji: '☠️',
      title: t('poisoning'),
      content: t('poisoningText')
    },
    {
      emoji: '🦴',
      title: t('fractures'),
      content: t('fracturesText')
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.emoji}>🚑</Text>
        <Text style={styles.title}>{t('firstAidTitle')}</Text>
        <Text style={styles.subtitle}>{t('firstAidSubtitle')}</Text>
      </View>

      {emergencyItems.map((item, index) => (
        <View key={index} style={styles.emergencyCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
          <Text style={styles.itemContent}>{item.content}</Text>
        </View>
      ))}

      <View style={styles.emergencyNumbers}>
        <Text style={styles.emergencyTitle}>{t('firstAidNumbers')}</Text>
        <View style={styles.numberCard}>
          <Text style={styles.numberText}>{t('firstAidPoison')}</Text>
          <Text style={styles.numberSubtext}>(855) 764-7661</Text>
        </View>
        <View style={styles.numberCard}>
          <Text style={styles.numberText}>{t('firstAidEmergency')}</Text>
          <Text style={styles.numberSubtext}>{t('firstAidEmergencyText')}</Text>
        </View>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimer}>
          {t('firstAidDisclaimer')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF5F8',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF6B9D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E7A8B',
    textAlign: 'center',
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4757',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4757',
    flex: 1,
  },
  itemContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  emergencyNumbers: {
    backgroundColor: '#FFE8E8',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4757',
    textAlign: 'center',
    marginBottom: 15,
  },
  numberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4757',
    marginBottom: 4,
  },
  numberSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  disclaimerContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 15,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  disclaimer: {
    fontSize: 13,
    color: '#856404',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FirstAidGuideScreen;
