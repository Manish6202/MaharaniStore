import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 16;
const GAP = 16;
const ITEMS_PER_ROW = 4;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (PADDING * 2);
const ITEM_WIDTH = (AVAILABLE_WIDTH - (GAP * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;

const CategoriesScreen = ({ navigation }) => {
  const groceryCategories = [
    {
      id: 'vegetables',
      name: 'Vegetables',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn4gRQeJhVF0Z1kX_fJQBTuR6OjoQpAkNYfrPihV_w6RddSVnC73urjjSRhOSa8L9xNNqnS_76Kc_n_eNbIArXi-ok7VS13p1doGypNBwa467teh_EK6o4rLHFWgtaE0VjDya5FmJJXoZhtvIafpwZIX0FibQnyCe_A4Ke0sQqs3b1IGSazjMmI-XUeRu65j4-cWTHK9oZxkQ_W2jAa4RSkFPQ-LRsbAWNIWI1XTD8iELr2h0EM-Ch14a2UQ4dmrPowld5pzwLng',
    },
    {
      id: 'fruits',
      name: 'Fruits',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpIcvItsq54FIwIWutqzFPxEAyN9m-oAffsJ87vNmWtqJ_RiY2AIMXcPgmn8UZac04B4-QL_JwdJLoP03_pQI1T2N1NLpAesrkQdnx4T9wm0o4GKl-llo4xoC2ojtsN9K4lZ_Au-DyLB4POWhCr4j4DEa6o9v5CEHMYCp2LN4mKEnnyG_37sidYDgW_0cJAnojdZuhr6Xtt2NnUSnyZeTCtcrHNgXz4c1lUjWqK4Ukcey3bwuigdC95S3ATwgm0A8jBbFBJ2gXWA',
    },
    {
      id: 'dairy',
      name: 'Dairy & Eggs',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6EiCsp6_E2IGxoxAo_yodA9kI67DzSOwzo-jcKYsxMacoQHb8sWTbR7M-K24quKS7x4W6o0Npcf0taBmVt2RQs3Iqgd6BAK7lQ6U2cuJ5o2F0jod8YKYEPhlbFh_DOt2BE01tWdUdtKD0txY2BaMz4PG1sddKorPA09w7lfgN5dsyQF9V9AFZVppHlW1I7UWTElIiCxrq4mjbLdDQt8aBu6EhkpeUohmanxAeG5CCVJXY_QsdEMv2tfQRL6aqqYswlqguqdlfdQ',
    },
    {
      id: 'bakery',
      name: 'Bakery',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJTqjIpvV9em2_XYBRUu8soD1OnQuTCjGvl-vL2DH0q4G4AgdIMDJ2gePUAg7Vibcz0LNlKHkW1PipCq9qoo0A58agwGK2pV7rSHcF2yjlbPtYn8Mpcuwe31e9bwEbjkZtFlbXW37bY4MR_sFH32KW4KVGnqPAHkQu-5QsD4P7M3L_PBqHP_oH2jn859Ze3Jt82hXkDH8ujfLV6ttEGm4Rh-gAxU86VJm6oQdmn5bkj4Q-EGEMPF3zmMbPhQ7nCv83RQdiK21svg',
    },
    {
      id: 'staples',
      name: 'Staples',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm2xI2YUCVFa6FCG5WTd8ls_YogKesE-ukRheEBuuuI51qbJlm803NSn5yCJjfaem505QZ0i0-o5v8CplIOXcxxBNzXRwxgpXDSt98BSOQZtg5YbP6riXYnEV9Up6NCxadHhvxfmEaHtxEa3SUu0_WAyMe1UMAK-wARuEE32A3zdEnicZRJyOVTVQZ2hH44AnSC9BYqGr83IoOrY-lovXC7TJFUUMYgC0iXKbUa9og5qHguGnOW6ohSAtOMAJJvpd1s7dPDnzvfw',
    },
    {
      id: 'snacks',
      name: 'Snacks',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlJ4acTFGq__EsaUU4FzJHnz6B3wLYe_6ecAgKgE9tT27jE0pv3f3lo_hFmG8kpJ-K0fTbBVuiXfK1AYBqtbqAWV0j5wvUBu2BXK5NHMe7k_UnkF7xcjf8oaC8hCqHiBG-eKYysFnlxkvgPubAAgMlGEQn88ZxRvR9DXThlh6ryq1uPLx_lOhRKIt7H6rieua7MiiCJVxPmZLXc8JrcFSn3viTo10rREMZ9UvMl7z1dadzuEtzwISYO0zkWDC7_WnUsH7GvqxeJw',
    },
    {
      id: 'frozen',
      name: 'Frozen',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRtydjWbxfD3fPMddvTrbjNaPF4AW_RMLJo72XMTfiI0LGhH7vVp6y0H_UkvCkfjJvvxGaRe0vnBphBVnYmG_ZowPx-zv86nTwpVp713gc8jaovRET_m2SoYoDe5IpHpPe5CkkhL9GTFvV4ywsSgtkvmq5kTORiPxPmpcr0LXYO8FRYr6yQKm99dT8ktzAdjZilkP7H03pboO5yg8a8yQf_7zMLcTdi6wKaEqnrCYPBRSrNZLUbtRSOQ4rphnWjSggaQGWCmWxjA',
    },
    {
      id: 'household',
      name: 'Household',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP65yy02P0OtG6JmJZl3uXEHPmLnvxc2IlkMYD9aJyvMlryVse5T1h7PHMYYiHyCGtfOMIyZ0Wtd-TGFpxeo-hlRcrPdHkwQNg43gNu-YIpmGlBTcxSBZtaKCkJL-nuK4sC7iBK8rLd8pBMAQTmChV1S1665jD2rn5c1LuStvvGL7A1KcFIB8-J5N6_y3iqIq7_uJ02UJH4ITW3NbjOH7qmwf6CKdLFpSXr5bJdnuhWo752BiolCcic0kXpK6E89mZCXXn6swb4g',
    },
  ];

  const beautyCategories = [
    {
      id: 'skincare',
      name: 'Skincare',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWv9XQIfHsGg_uZ2NspTN20fjjyYMjS3gsI3Abhxd4ZPBCvXDKw3pO61evUWVaYubvgpICotZYur-vsoAnrjjaDT5xithib0iB4P9E-orlG929hRWi0Pm2wf82W-62aAEwnejoL94dUGIvIseGbOAtEHR4Fst7l-7Ah326cJsq4w8l9dB-a6MMH1fEBcqVaC-yjfNNXV1qSdI4C6V-WrrpZhD8XWiTItow8WqHKKXq07c-5Cwm0WZSVXDPUv3476SDgX6NRKhiFg',
    },
    {
      id: 'makeup',
      name: 'Makeup',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMxO7ykd6AFBOPQyx1DVjPBg7C17_SCngzGbpg9F3mt63NeFYchwQLUkMnSAulIZBrn-rrHF_5Qp-ituKjgYd1y8MasLSCH_yDTd325Bvw4lHUCFprd9x84X7WAR09O7ImXdwv5KoAHyCBedOrRH7NFBPh36HL0Numool5IEZqN-MIC5g5JxJWdb3AzWNkvfqEPD-6IjO60QjMTuzV0ytYTyx7w9F5tQw0mft9itBRqJCTCT_ByQvKQIgPB657EZlxE3Y86kcxLA',
    },
    {
      id: 'haircare',
      name: 'Hair Care',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDozwFj28BYSjThgGBDXemnsUM8HQGa2xwzXBmjTBJaQUbMxOdmRzfBbtpv4wA5dsnW8dY8G5DOFSKghL1a3mT5ObTroGS5bjzuJqbsnoQAxncnlJZZE1yzcrQqF0SW6cI09YdSU00d4GXCaEyOXsZQdQnZe2kmkJv18_PZUPGXzxf232Iyo5vqXpJHOFGlqS2PADNjXx5w5R-inIG0Q1Jl3W0f28nN_l77GpsduAzTKnihHZoLE577QO0GLwiC7yn1Ijgis3JOZw',
    },
    {
      id: 'fragrance',
      name: 'Fragrance',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ1RUH4BLNEyTBKzd89C9MfW6jy5UqYU9AQHHXGnk5rtBNei52graThOhxZoi5dS68ZcI5eyOxO2dl419A8hsQBlJzl6H2YaJnAcnq64b-suWGW70FGfRipD31UYjbb8qKTLRUj7SqsNfkHtsQpWn8x2aB9zPoyD4Rih3ODA5ILRoTqhGxFCF8tXzE47mD5maaI87ImH-FDRRj6MWvUrmFdzDSHDSvZ_V3xXRmJx4AdlCsEpQYDzYj-dooF3VW0UhZoerMgeHO2A',
    },
    {
      id: 'bathbody',
      name: 'Bath & Body',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9SZIe5RPLQduQz5D813ZLElWS-fcYei_JfyeZrRr3yyegkZnKVYJgALG2gcTr5bcz0L5McIqk1IjNHjlstTand6pMtCe3kZ8H74QjA7L8r-GpPXEU-2mzSrLJclB7prm4YiEECGO-PmHjrnqxTaPxpeXPSv8rNrS1-m0TcNavGdlzZ90Rd4FZQcrTWdZioBVXLX-fo_LhFCC9o4vghqLH4nzkBlt2kZPoifMebjxtHKbJSEBA-3jWRGXiY_blOjkPIAjuyksrPA',
    },
    {
      id: 'grooming',
      name: 'Grooming',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnB6UMisqW3XuqjQIXMDeJHE9ZwDatUDERatziBW8Le4NIOm-fvjcvS72afWfLL1iOOTJpWbhl8MTDxcBArhnk7yBTv2QoxxQhUEihpz7-0BpPsJgUxrnDnrONMOlQZnsce05heITKfr32HNd6pdmOy5mpCoJBrsxPtcj5qvGRchLPeUWykZp-cJfpcOV_AF_NadhFOJzU8qa9M-UilEXpD0YaNsK457suODk-1gkrI8FThuIIaEsSRg3eWFkZmoeKnhNFHMJJNw',
    },
    {
      id: 'babycare',
      name: 'Baby Care',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbL3nDw9VjaYeqtq9dqL88U5GfjDXXcKS1uZ8VJxGf_0dyzHNcFj_aROlxpPIQ3IU8uNWsGMauSpSz3YCZkvgLS0Uuy_iEUL5E2Hln1q3kcO29OarlOu6hIqITp-a3gFYx-PORRpBiAWJ1kiI40SrapBYvKBHMatT0Pp_rRKXbnqa78_LrCBU5DglkH98o1shSH-UUXufyWEJcfKEjiXeOcDpMjs__bifLPgmO-exylW5_x0_pD4mZ5KuC2LNnTaYEz1RdsU60AA',
    },
    {
      id: 'wellness',
      name: 'Wellness',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx7kqVOFz2aF6QaGUpeJ4z4CW64pDfKXSgX5xHnnN89eOOsgffAG0RlOq9KF09JN-lBygoXOmhHsnGLL5Kb_P3PjuBrD0dbD2BuV6cn1V1p-fB0E4UfJKrZ3Uc8xZz5Fx-zJKncM6Vv9P6uVXxUMRAFVZcQHgkMFj2_YPapIL9xWZKyv3Uflu0iASA452KzBfwy0IhE03yGlkx-eRsjGz3oJt9IS58JTWcC8dEX4T64vwFNGRcWXXls6HAqSFAKFxg0g1b0keTsA',
    },
  ];

  const handleCategoryPress = (categoryId, categoryName) => {
    // Navigate to Grocery screen for grocery categories
    if (groceryCategories.find(cat => cat.id === categoryId)) {
      navigation.navigate('Grocery', { category: categoryName });
    } else {
      // For beauty categories, navigate to Categories with filter
      navigation.navigate('Grocery', { category: categoryName, type: 'beauty' });
    }
  };

  const renderCategoryItem = (category, isGrocery, index) => {
    const isLastInRow = (index + 1) % ITEMS_PER_ROW === 0;
    const isFirstRow = index < ITEMS_PER_ROW;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          !isLastInRow && styles.categoryItemMargin,
          !isFirstRow && styles.categoryItemTopMargin,
        ]}
        onPress={() => handleCategoryPress(category.id, category.name)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.categoryIconContainer,
            isGrocery ? styles.groceryIconBg : styles.beautyIconBg,
          ]}
        >
          <Image
            source={{ uri: category.icon }}
            style={styles.categoryIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grocery Essentials Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.accentBar, styles.groceryAccent]} />
            <Text style={styles.sectionTitle}>Grocery Essentials</Text>
          </View>
          <View style={styles.categoryGrid}>
            {groceryCategories.map((category, index) =>
              renderCategoryItem(category, true, index)
            )}
          </View>
        </View>

        {/* Beauty & Personal Care Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.accentBar, styles.beautyAccent]} />
            <Text style={styles.sectionTitle}>Beauty & Personal Care</Text>
          </View>
          <View style={styles.categoryGrid}>
            {beautyCategories.map((category, index) =>
              renderCategoryItem(category, false, index)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FDFDFD',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 24,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  groceryAccent: {
    backgroundColor: '#4CAF50',
  },
  beautyAccent: {
    backgroundColor: '#E91E63',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  categoryItemMargin: {
    marginRight: GAP,
  },
  categoryItemTopMargin: {
    marginTop: GAP,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groceryIconBg: {
    backgroundColor: '#F0FDF4', // green-50 equivalent
  },
  beautyIconBg: {
    backgroundColor: '#FDF2F8', // pink-50 equivalent
  },
  categoryIcon: {
    width: 40,
    height: 40,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
