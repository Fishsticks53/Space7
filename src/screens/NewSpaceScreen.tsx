import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import * as api from '../api';
import type { Visibility } from '../api';
import { Button } from '../components/Button';
import { FormScroll } from '../components/FormScroll';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { border, colors } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'NewSpace'>;

const MAX_DESCRIPTION = 400;
const MAX_TAGS = 10;

// Mirrors createSpaceSchema in the backend.
export function validateSpace(title: string, description: string) {
  if (title.length < 3 || title.length > 200)
    return 'Title must be 3 to 200 characters.';
  if (description.length < 10)
    return 'Description must be at least 10 characters.';
  return null;
}

export function normalizeTag(raw: string) {
  return raw
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, '')
    .toLowerCase()
    .slice(0, 50);
}

export function NewSpaceScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    const tag = normalizeTag(tagInput);
    if (tag && tags.length < MAX_TAGS && !tags.includes(tag))
      setTags([...tags, tag]);
    setTagInput('');
  };

  const create = async () => {
    const problem = validateSpace(title.trim(), description.trim());
    if (problem) {
      Alert.alert('New space', problem);
      return;
    }
    setSubmitting(true);
    try {
      const space = await api.createSpace({
        title: title.trim(),
        description: description.trim(),
        visibility,
        hashtags: tags,
      });
      navigation.replace('Chat', {
        spaceId: space.space_id,
        title: space.title,
      });
    } catch (e) {
      Alert.alert('Could not create space', (e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Header title="New space" color={colors.yellow} />
      <FormScroll>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          placeholder="What's the topic?"
        />
        <View>
          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={MAX_DESCRIPTION}
            placeholder="What should people discuss here?"
          />
          <Text variant="caption" style={styles.counter}>
            {description.length} / {MAX_DESCRIPTION}
          </Text>
        </View>
        <View style={styles.tagRow}>
          <View style={styles.flex}>
            <TextField
              label={`Hashtags (${tags.length}/${MAX_TAGS})`}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              autoCapitalize="none"
              placeholder="#design"
              returnKeyType="done"
              blurOnSubmit={false}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add hashtag"
            onPress={addTag}
            style={styles.addTag}
          >
            <Ionicons name="add" size={26} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.chips}>
          {tags.map(tag => (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityLabel={`Remove hashtag ${tag}`}
              onPress={() => setTags(tags.filter(t => t !== tag))}
              style={styles.chip}
            >
              <Text variant="label">#{tag}</Text>
              <Ionicons name="close" size={16} color={colors.ink} />
            </Pressable>
          ))}
        </View>
        <Text variant="label">Who can join?</Text>
        <View style={styles.visibility}>
          {(['public', 'private'] as const).map(v => {
            const active = visibility === v;
            return (
              <Pressable
                key={v}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setVisibility(v)}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      v === 'public' ? colors.green : colors.pink,
                  },
                  active && styles.optionActive,
                ]}
              >
                <Ionicons
                  name={
                    v === 'public' ? 'globe-outline' : 'lock-closed-outline'
                  }
                  size={22}
                  color={colors.ink}
                />
                <Text variant="title">
                  {v === 'public' ? 'Public' : 'Private'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text variant="caption">
          {visibility === 'public'
            ? 'Anyone can find and join this space.'
            : 'Only people with an invite code can join. You can create codes from the space details.'}
        </Text>
        <Button title="Create space" onPress={create} loading={submitting} />
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  counter: { textAlign: 'right', marginTop: 4 },
  tagRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  addTag: {
    ...border,
    borderRadius: 12,
    backgroundColor: colors.yellow,
    padding: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    ...border,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: colors.sky,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visibility: { flexDirection: 'row', gap: 12 },
  option: {
    ...border,
    flex: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.55,
  },
  optionActive: { opacity: 1, borderWidth: 4 },
});
