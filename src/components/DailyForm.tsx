import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Camera, Plus, X, Save, Trash2, Loader2 } from 'lucide-react';
import { supabase, DailyEntry, MealEntry, WorkoutEntry } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type DailyFormProps = {
  date: Date;
  onUpdate: () => void;
};

const DailyForm: React.FC<DailyFormProps> = ({ date, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [meals, setMeals] = useState<(MealEntry & { file?: File })[]>([]);
  const [workouts, setWorkouts] = useState<(WorkoutEntry & { file?: File })[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchDailyData = async () => {
      setLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Get or create daily entry
      let { data: entryData, error: entryError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', formattedDate)
        .single();
      
      if (entryError && entryError.code === 'PGRST116') {
        // No entry found, create a new one
        const { data: newEntry, error: createError } = await supabase
          .from('daily_entries')
          .insert({
            user_id: user.id,
            date: formattedDate,
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating daily entry:', createError);
          setLoading(false);
          return;
        }
        
        entryData = newEntry;
      } else if (entryError) {
        console.error('Error fetching daily entry:', entryError);
        setLoading(false);
        return;
      }
      
      setDailyEntry(entryData);
      if (entryData.weight) {
        setWeight(entryData.weight.toString());
      }
      
      // Fetch meals
      const { data: mealsData, error: mealsError } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('daily_entry_id', entryData.id)
        .order('created_at', { ascending: true });
      
      if (mealsError) {
        console.error('Error fetching meals:', mealsError);
      } else {
        setMeals(mealsData || []);
      }
      
      // Fetch workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workout_entries')
        .select('*')
        .eq('daily_entry_id', entryData.id)
        .order('created_at', { ascending: true });
      
      if (workoutsError) {
        console.error('Error fetching workouts:', workoutsError);
      } else {
        setWorkouts(workoutsData || []);
      }
      
      setLoading(false);
    };
    
    fetchDailyData();
  }, [date, user]);

  const handleSave = async () => {
    if (!user || !dailyEntry) return;
    
    setSaving(true);
    
    try {
      // Update weight
      if (weight) {
        await supabase
          .from('daily_entries')
          .update({ weight: parseFloat(weight) })
          .eq('id', dailyEntry.id);
      }
      
      // Process meals with images
      for (const meal of meals) {
        if (meal.file) {
          const fileName = `${user.id}/${Date.now()}-${meal.file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('meal_images')
            .upload(fileName, meal.file);
          
          if (uploadError) {
            console.error('Error uploading meal image:', uploadError);
            continue;
          }
          
          const { data: urlData } = supabase.storage
            .from('meal_images')
            .getPublicUrl(fileName);
          
          if (meal.id.startsWith('new-')) {
            // Create new meal entry
            await supabase.from('meal_entries').insert({
              daily_entry_id: dailyEntry.id,
              description: meal.description,
              image_url: urlData.publicUrl,
            });
          } else {
            // Update existing meal entry
            await supabase
              .from('meal_entries')
              .update({ 
                description: meal.description,
                image_url: urlData.publicUrl,
              })
              .eq('id', meal.id);
          }
        } else if (meal.id.startsWith('new-')) {
          // Create new meal entry without image
          await supabase.from('meal_entries').insert({
            daily_entry_id: dailyEntry.id,
            description: meal.description,
          });
        } else {
          // Update existing meal entry without changing image
          await supabase
            .from('meal_entries')
            .update({ description: meal.description })
            .eq('id', meal.id);
        }
      }
      
      // Process workouts with images
      for (const workout of workouts) {
        if (workout.file) {
          const fileName = `${user.id}/${Date.now()}-${workout.file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('workout_images')
            .upload(fileName, workout.file);
          
          if (uploadError) {
            console.error('Error uploading workout image:', uploadError);
            continue;
          }
          
          const { data: urlData } = supabase.storage
            .from('workout_images')
            .getPublicUrl(fileName);
          
          if (workout.id.startsWith('new-')) {
            // Create new workout entry
            await supabase.from('workout_entries').insert({
              daily_entry_id: dailyEntry.id,
              description: workout.description,
              image_url: urlData.publicUrl,
            });
          } else {
            // Update existing workout entry
            await supabase
              .from('workout_entries')
              .update({ 
                description: workout.description,
                image_url: urlData.publicUrl,
              })
              .eq('id', workout.id);
          }
        } else if (workout.id.startsWith('new-')) {
          // Create new workout entry without image
          await supabase.from('workout_entries').insert({
            daily_entry_id: dailyEntry.id,
            description: workout.description,
          });
        } else {
          // Update existing workout entry without changing image
          await supabase
            .from('workout_entries')
            .update({ description: workout.description })
            .eq('id', workout.id);
        }
      }
      
      onUpdate();
    } catch (error) {
      console.error('Error saving daily data:', error);
    } finally {
      setSaving(false);
    }
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        id: `new-${Date.now()}`,
        daily_entry_id: dailyEntry?.id || '',
        description: '',
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const addWorkout = () => {
    setWorkouts([
      ...workouts,
      {
        id: `new-${Date.now()}`,
        daily_entry_id: dailyEntry?.id || '',
        description: '',
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handleMealChange = (id: string, description: string) => {
    setMeals(
      meals.map((meal) =>
        meal.id === id ? { ...meal, description } : meal
      )
    );
  };

  const handleWorkoutChange = (id: string, description: string) => {
    setWorkouts(
      workouts.map((workout) =>
        workout.id === id ? { ...workout, description } : workout
      )
    );
  };

  const handleMealImageChange = (id: string, file: File) => {
    setMeals(
      meals.map((meal) =>
        meal.id === id ? { ...meal, file } : meal
      )
    );
  };

  const handleWorkoutImageChange = (id: string, file: File) => {
    setWorkouts(
      workouts.map((workout) =>
        workout.id === id ? { ...workout, file } : workout
      )
    );
  };

  const removeMeal = async (id: string) => {
    if (id.startsWith('new-')) {
      setMeals(meals.filter((meal) => meal.id !== id));
    } else {
      try {
        await supabase.from('meal_entries').delete().eq('id', id);
        setMeals(meals.filter((meal) => meal.id !== id));
      } catch (error) {
        console.error('Error removing meal:', error);
      }
    }
  };

  const removeWorkout = async (id: string) => {
    if (id.startsWith('new-')) {
      setWorkouts(workouts.filter((workout) => workout.id !== id));
    } else {
      try {
        await supabase.from('workout_entries').delete().eq('id', id);
        setWorkouts(workouts.filter((workout) => workout.id !== id));
      } catch (error) {
        console.error('Error removing workout:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Poids</h3>
          <div className="flex items-center">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Poids en kg"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              step="0.1"
              min="0"
            />
            <span className="ml-2 text-gray-600">kg</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-700">Repas</h3>
            <button
              onClick={addMeal}
              className="flex items-center text-sm text-teal-600 hover:text-teal-800"
            >
              <Plus size={16} className="mr-1" />
              Ajouter un repas
            </button>
          </div>
          
          <div className="space-y-4">
            {meals.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Aucun repas enregistré</p>
            ) : (
              meals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <div className="flex space-x-2">
                      <label className="relative cursor-pointer">
                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          {meal.image_url || meal.file ? (
                            <img
                              src={meal.file ? URL.createObjectURL(meal.file) : meal.image_url}
                              alt="Repas"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera size={24} className="text-gray-400" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleMealImageChange(meal.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <textarea
                        value={meal.description}
                        onChange={(e) => handleMealChange(meal.id, e.target.value)}
                        placeholder="Description du repas"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={() => removeMeal(meal.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-700">Activités sportives</h3>
            <button
              onClick={addWorkout}
              className="flex items-center text-sm text-teal-600 hover:text-teal-800"
            >
              <Plus size={16} className="mr-1" />
              Ajouter une activité
            </button>
          </div>
          
          <div className="space-y-4">
            {workouts.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Aucune activité enregistrée</p>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <div className="flex space-x-2">
                      <label className="relative cursor-pointer">
                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          {workout.image_url || workout.file ? (
                            <img
                              src={workout.file ? URL.createObjectURL(workout.file) : workout.image_url}
                              alt="Activité"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera size={24} className="text-gray-400" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleWorkoutImageChange(workout.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <textarea
                        value={workout.description}
                        onChange={(e) => handleWorkoutChange(workout.id, e.target.value)}
                        placeholder="Description de l'activité"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={() => removeWorkout(workout.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DailyForm;